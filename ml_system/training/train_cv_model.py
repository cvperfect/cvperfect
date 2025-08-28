"""
CVPerfect ML System - Model Training
Multi-task training for CV optimization, ATS scoring, and industry classification
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    TrainingArguments, Trainer, 
    get_linear_schedule_with_warmup
)
import logging
import json
import numpy as np
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from datetime import datetime
import wandb  # For experiment tracking
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns

from data_pipeline import CVDataCurator, CVDataPoint
from ..models.cv_optimizer import CVOptimizationModel, INDUSTRY_CATEGORIES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CVOptimizationDataset(Dataset):
    """PyTorch dataset for CV optimization training"""
    
    def __init__(self, cv_data: List[CVDataPoint], tokenizer, max_length: int = 1024):
        self.cv_data = cv_data
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.industry_to_id = {industry: i for i, industry in enumerate(INDUSTRY_CATEGORIES)}
        
    def __len__(self):
        return len(self.cv_data)
    
    def __getitem__(self, idx):
        cv = self.cv_data[idx]
        
        # Tokenize original CV text
        original_encoding = self.tokenizer(
            cv.original_text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Tokenize optimized CV text (target for language modeling)
        optimized_encoding = self.tokenizer(
            cv.optimized_text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Industry classification label
        industry_id = self.industry_to_id.get(cv.industry, 0)
        
        # ATS score (normalized 0-1)
        ats_score = cv.ats_score / 100.0
        
        return {
            'input_ids': original_encoding['input_ids'].squeeze(),
            'attention_mask': original_encoding['attention_mask'].squeeze(),
            'optimized_ids': optimized_encoding['input_ids'].squeeze(),
            'optimized_attention_mask': optimized_encoding['attention_mask'].squeeze(),
            'industry_label': torch.tensor(industry_id, dtype=torch.long),
            'ats_score': torch.tensor(ats_score, dtype=torch.float),
            'job_level': cv.job_level,
            'experience_years': cv.experience_years,
            'language': cv.language
        }


class MultiTaskCVTrainer:
    """Multi-task trainer for CV optimization models"""
    
    def __init__(self, 
                 model_name: str = "meta-llama/Llama-3.1-7B-Instruct",
                 output_dir: str = "ml_system/models/checkpoints",
                 use_wandb: bool = True):
        
        self.model_name = model_name
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
        self.model = CVOptimizationModel(model_name, num_industries=len(INDUSTRY_CATEGORIES))
        
        # Training configuration
        self.config = {
            'learning_rate': 2e-5,
            'batch_size': 4,  # Small batch size for GPU memory
            'gradient_accumulation_steps': 8,  # Effective batch size: 32
            'max_epochs': 3,
            'warmup_steps': 1000,
            'weight_decay': 0.01,
            'max_grad_norm': 1.0,
            'eval_steps': 500,
            'save_steps': 1000,
            'logging_steps': 100
        }
        
        # Multi-task loss weights
        self.loss_weights = {
            'language_modeling': 0.4,
            'industry_classification': 0.3,
            'ats_scoring': 0.3
        }
        
        # Initialize experiment tracking
        if use_wandb:
            wandb.init(
                project="cvperfect-ml",
                config=self.config,
                name=f"cv-optimizer-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            )
        
        logger.info(f"Initialized MultiTaskCVTrainer with {model_name}")
    
    def prepare_datasets(self, train_ratio: float = 0.8, val_ratio: float = 0.1) -> Tuple[Dataset, Dataset, Dataset]:
        """Prepare training, validation, and test datasets"""
        
        logger.info("Loading training data...")
        curator = CVDataCurator()
        
        # Load all available training data
        all_cv_data = curator.get_training_data(min_quality=70.0)
        logger.info(f"Loaded {len(all_cv_data):,} CV training samples")
        
        # Create PyTorch dataset
        full_dataset = CVOptimizationDataset(all_cv_data, self.tokenizer)
        
        # Split into train/val/test
        total_size = len(full_dataset)
        train_size = int(train_ratio * total_size)
        val_size = int(val_ratio * total_size)
        test_size = total_size - train_size - val_size
        
        train_dataset, val_dataset, test_dataset = random_split(
            full_dataset, [train_size, val_size, test_size],
            generator=torch.Generator().manual_seed(42)
        )
        
        logger.info(f"Dataset splits: Train={len(train_dataset):,}, Val={len(val_dataset):,}, Test={len(test_dataset):,}")
        
        return train_dataset, val_dataset, test_dataset
    
    def compute_multi_task_loss(self, 
                               model_outputs: Dict, 
                               batch: Dict) -> Tuple[torch.Tensor, Dict[str, float]]:
        """Compute multi-task loss with weighted components"""
        
        losses = {}
        
        # 1. Language modeling loss (CV optimization)
        if 'optimized_ids' in batch:
            lm_logits = model_outputs.get('lm_logits')
            if lm_logits is not None:
                target_ids = batch['optimized_ids']
                # Shift for causal language modeling
                shift_logits = lm_logits[..., :-1, :].contiguous()
                shift_labels = target_ids[..., 1:].contiguous()
                
                lm_loss_fn = nn.CrossEntropyLoss(ignore_index=self.tokenizer.pad_token_id)
                lm_loss = lm_loss_fn(shift_logits.view(-1, shift_logits.size(-1)), 
                                   shift_labels.view(-1))
                losses['language_modeling'] = lm_loss
        
        # 2. Industry classification loss
        if 'industry_predictions' in model_outputs and 'industry_label' in batch:
            industry_logits = model_outputs['industry_predictions']
            industry_labels = batch['industry_label']
            
            industry_loss_fn = nn.CrossEntropyLoss()
            industry_loss = industry_loss_fn(industry_logits, industry_labels)
            losses['industry_classification'] = industry_loss
        
        # 3. ATS scoring loss
        if 'ats_predictions' in model_outputs and 'ats_score' in batch:
            ats_pred = model_outputs['ats_predictions'].squeeze()
            ats_target = batch['ats_score']
            
            ats_loss_fn = nn.MSELoss()
            ats_loss = ats_loss_fn(ats_pred, ats_target)
            losses['ats_scoring'] = ats_loss
        
        # Compute weighted total loss
        total_loss = torch.tensor(0.0, device=next(self.model.parameters()).device)
        loss_components = {}
        
        for task, loss in losses.items():
            weight = self.loss_weights.get(task, 1.0)
            weighted_loss = weight * loss
            total_loss += weighted_loss
            loss_components[task] = loss.item()
        
        return total_loss, loss_components
    
    def train_epoch(self, train_dataloader: DataLoader, optimizer, scheduler, epoch: int):
        """Train for one epoch"""
        
        self.model.train()
        total_loss = 0.0
        total_loss_components = {task: 0.0 for task in self.loss_weights.keys()}
        
        for step, batch in enumerate(train_dataloader):
            # Move batch to device
            device = next(self.model.parameters()).device
            batch = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in batch.items()}
            
            # Forward pass
            with torch.cuda.amp.autocast():  # Mixed precision training
                # Get model outputs (simplified for demonstration)
                embeddings = self.model.encode_cv(batch['input_ids'])
                
                model_outputs = {
                    'industry_predictions': self.model.cv_head(embeddings),
                    'ats_predictions': self.model.ats_scorer(embeddings)
                }
                
                # Compute loss
                loss, loss_components = self.compute_multi_task_loss(model_outputs, batch)
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.config['max_grad_norm'])
            
            # Optimizer step
            if (step + 1) % self.config['gradient_accumulation_steps'] == 0:
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
            
            # Update metrics
            total_loss += loss.item()
            for task, component_loss in loss_components.items():
                total_loss_components[task] += component_loss
            
            # Logging
            if step % self.config['logging_steps'] == 0:
                avg_loss = total_loss / (step + 1)
                logger.info(f"Epoch {epoch}, Step {step}: Loss={avg_loss:.4f}")
                
                if wandb.run:
                    wandb.log({
                        'train/loss': avg_loss,
                        'train/lr': scheduler.get_last_lr()[0],
                        'train/step': step + epoch * len(train_dataloader)
                    })
        
        # End of epoch metrics
        avg_loss = total_loss / len(train_dataloader)
        avg_components = {task: loss / len(train_dataloader) for task, loss in total_loss_components.items()}
        
        logger.info(f"Epoch {epoch} completed - Average Loss: {avg_loss:.4f}")
        for task, loss in avg_components.items():
            logger.info(f"  {task}: {loss:.4f}")
        
        return avg_loss, avg_components
    
    def evaluate(self, val_dataloader: DataLoader, epoch: int) -> Dict[str, float]:
        """Evaluate model on validation set"""
        
        self.model.eval()
        total_loss = 0.0
        industry_preds, industry_targets = [], []
        ats_preds, ats_targets = [], []
        
        with torch.no_grad():
            for batch in val_dataloader:
                device = next(self.model.parameters()).device
                batch = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in batch.items()}
                
                # Forward pass
                embeddings = self.model.encode_cv(batch['input_ids'])
                
                model_outputs = {
                    'industry_predictions': self.model.cv_head(embeddings),
                    'ats_predictions': self.model.ats_scorer(embeddings)
                }
                
                # Compute loss
                loss, _ = self.compute_multi_task_loss(model_outputs, batch)
                total_loss += loss.item()
                
                # Collect predictions for metrics
                industry_preds.extend(torch.argmax(model_outputs['industry_predictions'], dim=1).cpu().numpy())
                industry_targets.extend(batch['industry_label'].cpu().numpy())
                
                ats_preds.extend(model_outputs['ats_predictions'].squeeze().cpu().numpy())
                ats_targets.extend(batch['ats_score'].cpu().numpy())
        
        # Calculate metrics
        avg_loss = total_loss / len(val_dataloader)
        
        industry_accuracy = accuracy_score(industry_targets, industry_preds)
        industry_f1 = f1_score(industry_targets, industry_preds, average='weighted')
        
        ats_mse = mean_squared_error(ats_targets, ats_preds)
        ats_rmse = np.sqrt(ats_mse)
        
        metrics = {
            'val/loss': avg_loss,
            'val/industry_accuracy': industry_accuracy,
            'val/industry_f1': industry_f1,
            'val/ats_rmse': ats_rmse,
            'val/ats_mse': ats_mse
        }
        
        logger.info(f"Validation Epoch {epoch}:")
        logger.info(f"  Loss: {avg_loss:.4f}")
        logger.info(f"  Industry Accuracy: {industry_accuracy:.3f}")
        logger.info(f"  Industry F1: {industry_f1:.3f}")
        logger.info(f"  ATS RMSE: {ats_rmse:.3f}")
        
        if wandb.run:
            wandb.log(metrics)
        
        return metrics
    
    def train(self, save_best_model: bool = True) -> Dict[str, float]:
        """Full training pipeline"""
        
        logger.info("Starting CV model training...")
        
        # Prepare datasets
        train_dataset, val_dataset, test_dataset = self.prepare_datasets()
        
        # Create data loaders
        train_dataloader = DataLoader(
            train_dataset, 
            batch_size=self.config['batch_size'], 
            shuffle=True,
            num_workers=2
        )
        
        val_dataloader = DataLoader(
            val_dataset, 
            batch_size=self.config['batch_size'], 
            shuffle=False,
            num_workers=2
        )
        
        # Setup optimizer and scheduler
        optimizer = torch.optim.AdamW(
            self.model.parameters(), 
            lr=self.config['learning_rate'],
            weight_decay=self.config['weight_decay']
        )
        
        total_steps = len(train_dataloader) * self.config['max_epochs']
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=self.config['warmup_steps'],
            num_training_steps=total_steps
        )
        
        # Training loop
        best_val_loss = float('inf')
        training_history = {
            'train_loss': [],
            'val_loss': [],
            'val_industry_accuracy': [],
            'val_ats_rmse': []
        }
        
        for epoch in range(self.config['max_epochs']):
            logger.info(f"Starting epoch {epoch + 1}/{self.config['max_epochs']}")
            
            # Train
            train_loss, _ = self.train_epoch(train_dataloader, optimizer, scheduler, epoch)
            
            # Validate
            val_metrics = self.evaluate(val_dataloader, epoch)
            
            # Save metrics
            training_history['train_loss'].append(train_loss)
            training_history['val_loss'].append(val_metrics['val/loss'])
            training_history['val_industry_accuracy'].append(val_metrics['val/industry_accuracy'])
            training_history['val_ats_rmse'].append(val_metrics['val/ats_rmse'])
            
            # Save best model
            if save_best_model and val_metrics['val/loss'] < best_val_loss:
                best_val_loss = val_metrics['val/loss']
                best_model_path = self.output_dir / "best_cv_optimizer.pt"
                self.model.save_model(str(best_model_path))
                logger.info(f"Saved best model to {best_model_path}")
            
            # Save checkpoint
            if (epoch + 1) % 2 == 0:
                checkpoint_path = self.output_dir / f"cv_optimizer_epoch_{epoch + 1}.pt"
                self.model.save_model(str(checkpoint_path))
        
        # Final evaluation on test set
        test_dataloader = DataLoader(test_dataset, batch_size=self.config['batch_size'], shuffle=False)
        final_metrics = self.evaluate(test_dataloader, epoch=-1)  # Use -1 to indicate final eval
        
        # Save training history
        history_path = self.output_dir / "training_history.json"
        with open(history_path, 'w') as f:
            json.dump(training_history, f, indent=2)
        
        logger.info("Training completed successfully!")
        logger.info(f"Best validation loss: {best_val_loss:.4f}")
        logger.info(f"Final test metrics: {final_metrics}")
        
        return final_metrics
    
    def plot_training_history(self, history_path: Optional[str] = None):
        """Plot training history"""
        
        if history_path is None:
            history_path = self.output_dir / "training_history.json"
        
        with open(history_path, 'r') as f:
            history = json.load(f)
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Loss curves
        axes[0, 0].plot(history['train_loss'], label='Train Loss')
        axes[0, 0].plot(history['val_loss'], label='Validation Loss')
        axes[0, 0].set_title('Training and Validation Loss')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Loss')
        axes[0, 0].legend()
        
        # Industry classification accuracy
        axes[0, 1].plot(history['val_industry_accuracy'], label='Industry Accuracy', color='green')
        axes[0, 1].set_title('Industry Classification Accuracy')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Accuracy')
        axes[0, 1].legend()
        
        # ATS scoring RMSE
        axes[1, 0].plot(history['val_ats_rmse'], label='ATS RMSE', color='red')
        axes[1, 0].set_title('ATS Scoring RMSE')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('RMSE')
        axes[1, 0].legend()
        
        # Combined metrics
        axes[1, 1].plot(history['val_industry_accuracy'], label='Industry Acc', alpha=0.7)
        axes[1, 1].plot([1 - rmse for rmse in history['val_ats_rmse']], label='ATS Performance', alpha=0.7)
        axes[1, 1].set_title('Combined Model Performance')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Performance Score')
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig(self.output_dir / "training_history.png", dpi=300, bbox_inches='tight')
        logger.info(f"Training history plot saved to {self.output_dir / 'training_history.png'}")


if __name__ == "__main__":
    # Test model training
    print("🚀 CVPerfect ML Model Training - Starting...")
    
    # Initialize trainer
    trainer = MultiTaskCVTrainer(
        model_name="meta-llama/Llama-3.1-7B-Instruct",
        use_wandb=False  # Set to True if wandb is configured
    )
    
    # Start training
    try:
        final_metrics = trainer.train()
        print(f"✅ Training completed successfully!")
        print(f"📊 Final test metrics: {final_metrics}")
        
        # Plot training history
        trainer.plot_training_history()
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        logger.error(f"Training error: {e}", exc_info=True)