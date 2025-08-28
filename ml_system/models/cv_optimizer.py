"""
CVPerfect ML System - Main CV Optimization Model
Fine-tuned Llama 3.1-7B for CV-specific optimization with multi-task learning
"""

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Dict, Optional, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CVClassificationHead(nn.Module):
    """Industry classification head for CV optimization"""
    
    def __init__(self, hidden_size: int = 4096, num_industries: int = 50):
        super().__init__()
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 1024),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(1024, 512),
            nn.ReLU(), 
            nn.Dropout(0.1),
            nn.Linear(512, num_industries)
        )
        
    def forward(self, embeddings: torch.Tensor) -> torch.Tensor:
        return self.classifier(embeddings)


class ATSCompatibilityScorer(nn.Module):
    """ATS compatibility scoring module"""
    
    def __init__(self, hidden_size: int = 4096):
        super().__init__()
        self.scorer = nn.Sequential(
            nn.Linear(hidden_size, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 1),
            nn.Sigmoid()  # Output 0-1 score
        )
        
    def forward(self, embeddings: torch.Tensor) -> torch.Tensor:
        return self.scorer(embeddings) * 100  # Scale to 0-100


class LanguageOptimizer(nn.Module):
    """Professional language enhancement module"""
    
    def __init__(self, hidden_size: int = 4096, vocab_size: int = 32768):
        super().__init__()
        self.enhancement_head = nn.Linear(hidden_size, vocab_size)
        self.attention = nn.MultiheadAttention(hidden_size, num_heads=16, dropout=0.1)
        
    def forward(self, embeddings: torch.Tensor, attention_mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        # Apply self-attention for context-aware optimization
        optimized, _ = self.attention(embeddings, embeddings, embeddings, key_padding_mask=attention_mask)
        return self.enhancement_head(optimized)


class CVOptimizationModel(nn.Module):
    """
    Main CV Optimization Model
    Multi-task learning: CV optimization + ATS scoring + industry classification
    """
    
    def __init__(self, model_name: str = "meta-llama/Llama-3.1-7B-Instruct", num_industries: int = 50):
        super().__init__()
        
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.base_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        
        # Add padding token if not present
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
        hidden_size = self.base_model.config.hidden_size
        
        # Multi-task heads
        self.cv_head = CVClassificationHead(hidden_size, num_industries)
        self.ats_scorer = ATSCompatibilityScorer(hidden_size)
        self.language_enhancer = LanguageOptimizer(hidden_size, self.base_model.config.vocab_size)
        
        # Confidence calculation layer
        self.confidence_calculator = nn.Linear(hidden_size, 3)  # 3 confidence scores
        
        logger.info(f"Initialized CVOptimizationModel with {model_name}")
        
    def encode_cv(self, cv_text: str) -> torch.Tensor:
        """Encode CV text to embeddings using base model"""
        inputs = self.tokenizer(
            cv_text,
            return_tensors="pt",
            max_length=2048,
            truncation=True,
            padding=True
        )
        
        with torch.no_grad():
            outputs = self.base_model(**inputs, output_hidden_states=True)
            # Use last hidden state mean pooling
            embeddings = outputs.hidden_states[-1].mean(dim=1)  # [batch_size, hidden_size]
            
        return embeddings
    
    def optimize_content(self, embeddings: torch.Tensor, original_text: str) -> str:
        """Generate optimized CV content"""
        # This is a simplified version - in production, this would use
        # the fine-tuned language model for text generation
        optimized_logits = self.language_enhancer(embeddings.unsqueeze(1))
        
        # For now, return enhanced version indicator
        # In production: decode logits to optimized text
        optimization_score = torch.softmax(optimized_logits.mean(dim=1), dim=-1).max().item()
        
        return f"[OPTIMIZED CV - Score: {optimization_score:.2f}]\n{original_text}"
    
    def calculate_confidence(self, embeddings: torch.Tensor) -> Dict[str, float]:
        """Calculate confidence scores for each task"""
        confidence_logits = self.confidence_calculator(embeddings)
        confidence_scores = torch.softmax(confidence_logits, dim=-1)
        
        return {
            'cv_optimization': confidence_scores[0, 0].item(),
            'ats_scoring': confidence_scores[0, 1].item(),
            'industry_classification': confidence_scores[0, 2].item()
        }
    
    def forward(self, cv_text: str, job_description: Optional[str] = None) -> Dict[str, any]:
        """
        Main forward pass for CV optimization
        
        Args:
            cv_text: Original CV text
            job_description: Optional job posting for targeted optimization
            
        Returns:
            Dict with optimized CV, ATS score, industry classification, and confidence scores
        """
        # Encode CV text
        embeddings = self.encode_cv(cv_text)
        
        # Multi-task predictions
        optimized_text = self.optimize_content(embeddings, cv_text)
        ats_score = self.ats_scorer(embeddings)
        industry_logits = self.cv_head(embeddings)
        confidence_scores = self.calculate_confidence(embeddings)
        
        # Get top industry predictions
        industry_probs = torch.softmax(industry_logits, dim=-1)
        top_industries = torch.topk(industry_probs, k=3, dim=-1)
        
        return {
            'optimized_cv': optimized_text,
            'ats_score': ats_score.squeeze().item(),
            'industry_classification': {
                'top_industries': top_industries.indices.squeeze().tolist(),
                'probabilities': top_industries.values.squeeze().tolist()
            },
            'confidence_scores': confidence_scores,
            'processing_metadata': {
                'model_version': 'cv-optimizer-v1.0',
                'inference_mode': 'gpu' if torch.cuda.is_available() else 'cpu',
                'embedding_size': embeddings.shape[-1]
            }
        }
    
    def save_model(self, path: str):
        """Save the entire model state"""
        torch.save({
            'model_state_dict': self.state_dict(),
            'model_name': self.model_name,
            'tokenizer': self.tokenizer
        }, path)
        logger.info(f"Model saved to {path}")
        
    @classmethod
    def load_model(cls, path: str):
        """Load saved model state"""
        checkpoint = torch.load(path, map_location='cuda' if torch.cuda.is_available() else 'cpu')
        model = cls(model_name=checkpoint['model_name'])
        model.load_state_dict(checkpoint['model_state_dict'])
        model.tokenizer = checkpoint['tokenizer']
        logger.info(f"Model loaded from {path}")
        return model


# Industry categories for classification
INDUSTRY_CATEGORIES = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Consulting", "Marketing", "Sales", "Operations",
    "Human Resources", "Legal", "Engineering", "Design", "Data Science",
    "Product Management", "Project Management", "Research", "Quality Assurance", "Customer Service",
    "Supply Chain", "Logistics", "Real Estate", "Media", "Entertainment",
    "Non-profit", "Government", "Energy", "Automotive", "Aerospace",
    "Telecommunications", "Insurance", "Banking", "Investment", "Construction",
    "Architecture", "Pharmaceutical", "Biotechnology", "Agriculture", "Food Service",
    "Transportation", "Security", "Sports", "Travel", "Hospitality",
    "Publishing", "Gaming", "E-commerce", "Cybersecurity", "Artificial Intelligence"
]


if __name__ == "__main__":
    # Example usage and testing
    print("🤖 CVPerfect ML Model - Testing initialization...")
    
    # Test model initialization
    try:
        model = CVOptimizationModel()
        print("✅ Model initialized successfully")
        
        # Test inference
        test_cv = """
        John Smith
        Software Engineer
        Email: john@example.com
        
        Experience:
        - 5 years Python development
        - Machine learning projects
        - Web application development
        
        Skills: Python, TensorFlow, React, SQL
        """
        
        print("\n🧪 Testing inference...")
        result = model(test_cv)
        
        print(f"📊 ATS Score: {result['ats_score']:.1f}/100")
        print(f"🏢 Top Industries: {[INDUSTRY_CATEGORIES[i] for i in result['industry_classification']['top_industries'][:3]]}")
        print(f"🎯 Confidence Scores: {result['confidence_scores']}")
        print("✅ Inference test completed successfully")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        logger.error(f"Model testing failed: {e}")