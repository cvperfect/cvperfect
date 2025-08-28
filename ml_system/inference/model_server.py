"""
CVPerfect ML System - Model Inference Server
FastAPI-based inference server for CV optimization models with <2s response time
"""

import asyncio
import logging
import time
import json
from typing import Dict, List, Optional, Union, Any
from pathlib import Path
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
from datetime import datetime

# Import our models
import sys
sys.path.append(str(Path(__file__).parent.parent))

from models.cv_optimizer import CVOptimizationModel, INDUSTRY_CATEGORIES
from models.ats_scorer import EnhancedATSScorer, ATSScoreResult
from models.industry_classifier import CVIndustryClassifier, IndustryClassificationResult

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Pydantic models for API requests/responses
class CVOptimizationRequest(BaseModel):
    cv_text: str = Field(..., description="Original CV text content")
    job_description: Optional[str] = Field(None, description="Optional job posting for targeted optimization")
    plan: str = Field("basic", description="CVPerfect plan: basic, gold, premium")
    language: str = Field("auto", description="Language: auto, pl, en")
    template: str = Field("standard", description="Template: standard, modern, classic")
    model_version: str = Field("latest", description="Model version to use")
    
    class Config:
        schema_extra = {
            "example": {
                "cv_text": "John Smith\\nSoftware Engineer\\nExperience: 5 years Python development...",
                "job_description": "We are looking for a Senior Python Developer...",
                "plan": "premium",
                "language": "en",
                "template": "modern"
            }
        }


class CVOptimizationResponse(BaseModel):
    optimized_cv: str = Field(..., description="Optimized CV content")
    ats_score: float = Field(..., description="ATS compatibility score (0-100)")
    industry_classification: Dict[str, Any] = Field(..., description="Industry classification results")
    confidence_scores: Dict[str, float] = Field(..., description="Model confidence scores")
    performance_metrics: Dict[str, Any] = Field(..., description="Processing performance metrics")
    recommendations: List[str] = Field(..., description="Improvement recommendations")
    plan_features: Dict[str, bool] = Field(..., description="Available features for user's plan")


class ModelPerformanceMetrics(BaseModel):
    inference_time_ms: float
    model_version: str
    gpu_utilization: Optional[float]
    memory_usage_mb: float
    confidence_score: float
    timestamp: datetime


class CVInferenceServer:
    """High-performance CV optimization inference server"""
    
    def __init__(self, 
                 model_path: Optional[str] = None,
                 device: str = "auto",
                 enable_gpu_acceleration: bool = True,
                 max_batch_size: int = 4,
                 cache_size: int = 1000):
        
        self.device = self._select_device(device, enable_gpu_acceleration)
        self.max_batch_size = max_batch_size
        self.cache_size = cache_size
        
        # Initialize models
        self.cv_optimizer = None
        self.ats_scorer = EnhancedATSScorer()
        self.industry_classifier = CVIndustryClassifier()
        
        # Performance tracking
        self.performance_metrics = []
        self.inference_cache = {}  # Simple LRU-style cache
        
        # Model loading
        self._load_models(model_path)
        
        # Warmup
        self._warmup_models()
        
        logger.info(f"CV Inference Server initialized on device: {self.device}")
    
    def _select_device(self, device: str, enable_gpu: bool) -> str:
        """Select optimal device for inference"""
        if device == "auto":
            if enable_gpu and torch.cuda.is_available():
                device = "cuda"
                logger.info(f"GPU detected: {torch.cuda.get_device_name(0)}")
            else:
                device = "cpu"
                logger.info("Using CPU for inference")
        
        return device
    
    def _load_models(self, model_path: Optional[str]):
        """Load CV optimization models"""
        try:
            if model_path and Path(model_path).exists():
                logger.info(f"Loading custom model from {model_path}")
                self.cv_optimizer = CVOptimizationModel.load_model(model_path)
            else:
                logger.info("Loading base CV optimization model")
                self.cv_optimizer = CVOptimizationModel()
            
            # Move to device
            self.cv_optimizer = self.cv_optimizer.to(self.device)
            self.cv_optimizer.eval()
            
            logger.info("Models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise RuntimeError(f"Model loading failed: {e}")
    
    def _warmup_models(self):
        """Warmup models for optimal inference performance"""
        logger.info("Warming up models...")
        
        sample_cv = """John Smith
        Software Engineer
        Email: john@example.com
        Experience: Python development, React, AWS
        Skills: Python, JavaScript, Docker"""
        
        try:
            # Warmup inference
            for _ in range(3):
                _ = self._run_inference(sample_cv)
            
            logger.info("Model warmup completed")
            
        except Exception as e:
            logger.warning(f"Model warmup failed: {e}")
    
    async def optimize_cv(self, request: CVOptimizationRequest) -> CVOptimizationResponse:
        """Main CV optimization endpoint with performance monitoring"""
        
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(request.cv_text, request.job_description)
            if cache_key in self.inference_cache:
                cached_result = self.inference_cache[cache_key]
                cached_result.performance_metrics["cache_hit"] = True
                cached_result.performance_metrics["inference_time_ms"] = (time.time() - start_time) * 1000
                return cached_result
            
            # Run inference
            result = await self._run_inference_async(request)
            
            # Calculate performance metrics
            inference_time = (time.time() - start_time) * 1000
            result.performance_metrics["inference_time_ms"] = inference_time
            result.performance_metrics["cache_hit"] = False
            
            # Cache result (simple LRU)
            self._update_cache(cache_key, result)
            
            # Log performance
            self._log_performance_metrics(inference_time, result.confidence_scores)
            
            logger.info(f"CV optimization completed in {inference_time:.1f}ms")
            return result
            
        except Exception as e:
            logger.error(f"CV optimization failed: {e}")
            raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
    
    async def _run_inference_async(self, request: CVOptimizationRequest) -> CVOptimizationResponse:
        """Run asynchronous inference"""
        
        # Run CPU-bound inference in thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self._run_inference, request.cv_text, request.job_description, request.plan)
        
        return result
    
    def _run_inference(self, cv_text: str, job_description: Optional[str] = None, plan: str = "basic") -> CVOptimizationResponse:
        """Core inference logic"""
        
        with torch.inference_mode():  # Optimization for inference
            
            # 1. CV Optimization using ML model
            cv_optimization_result = self.cv_optimizer(cv_text, job_description)
            
            # 2. Enhanced ATS Scoring
            # Convert CV text to structured format for ATS scorer
            ats_result = self.ats_scorer.calculate_ats_score(cv_text, job_description)
            
            # 3. Industry Classification
            industry_result = self.industry_classifier.classify_industry(cv_text)
            
            # 4. Apply plan-based feature gating
            plan_features = self._get_plan_features(plan)
            
            # 5. Generate recommendations
            recommendations = self._generate_recommendations(
                cv_optimization_result, ats_result, industry_result, plan
            )
            
            # 6. Prepare response
            response = CVOptimizationResponse(
                optimized_cv=cv_optimization_result["optimized_cv"] if plan_features["ml_optimization"] else cv_text,
                ats_score=max(cv_optimization_result["ats_score"], ats_result.total_score),
                industry_classification={
                    "primary_industry": industry_result.primary_industry,
                    "confidence": industry_result.confidence,
                    "top_industries": industry_result.top_industries,
                    "reasoning": industry_result.reasoning
                },
                confidence_scores=cv_optimization_result["confidence_scores"],
                performance_metrics={
                    "model_version": cv_optimization_result["processing_metadata"]["model_version"],
                    "inference_mode": cv_optimization_result["processing_metadata"]["inference_mode"],
                    "plan": plan
                },
                recommendations=recommendations if plan_features["recommendations"] else recommendations[:2],
                plan_features=plan_features
            )
            
            return response
    
    def _get_plan_features(self, plan: str) -> Dict[str, bool]:
        """Get available features based on user's plan"""
        
        features = {
            "basic": {
                "ml_optimization": False,
                "industry_classification": True,
                "ats_scoring": True,
                "recommendations": True,
                "advanced_templates": False,
                "job_matching": False,
                "export_formats": ["pdf"],
                "priority_support": False
            },
            "gold": {
                "ml_optimization": True,
                "industry_classification": True,
                "ats_scoring": True,
                "recommendations": True,
                "advanced_templates": True,
                "job_matching": True,
                "export_formats": ["pdf", "docx"],
                "priority_support": False
            },
            "premium": {
                "ml_optimization": True,
                "industry_classification": True,
                "ats_scoring": True,
                "recommendations": True,
                "advanced_templates": True,
                "job_matching": True,
                "export_formats": ["pdf", "docx", "html"],
                "priority_support": True
            }
        }
        
        return features.get(plan, features["basic"])
    
    def _generate_recommendations(self, cv_result: Dict, ats_result: ATSScoreResult, 
                                industry_result: IndustryClassificationResult, plan: str) -> List[str]:
        """Generate comprehensive recommendations"""
        
        recommendations = []
        
        # ATS recommendations
        recommendations.extend(ats_result.recommendations[:3])
        
        # Industry-specific recommendations
        if industry_result.confidence > 70:
            recommendations.append(f"Consider highlighting {industry_result.primary_industry}-specific skills more prominently")
        
        # ML model recommendations (premium feature)
        if plan in ["gold", "premium"] and cv_result["confidence_scores"]["cv_optimization"] > 0.8:
            recommendations.append("Your CV structure is well-optimized for ATS systems")
        elif plan in ["gold", "premium"]:
            recommendations.append("Consider reorganizing sections for better ATS compatibility")
        
        # Confidence-based recommendations
        if cv_result["confidence_scores"]["industry_classification"] < 0.7:
            recommendations.append("Add more industry-specific keywords to improve clarity")
        
        return recommendations[:5]  # Limit to top 5
    
    def _generate_cache_key(self, cv_text: str, job_description: Optional[str]) -> str:
        """Generate cache key for request"""
        import hashlib
        content = cv_text + (job_description or "")
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    def _update_cache(self, key: str, result: CVOptimizationResponse):
        """Update inference cache with LRU eviction"""
        if len(self.inference_cache) >= self.cache_size:
            # Remove oldest entry
            oldest_key = next(iter(self.inference_cache))
            del self.inference_cache[oldest_key]
        
        self.inference_cache[key] = result
    
    def _log_performance_metrics(self, inference_time: float, confidence_scores: Dict[str, float]):
        """Log performance metrics for monitoring"""
        
        avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)
        
        metrics = ModelPerformanceMetrics(
            inference_time_ms=inference_time,
            model_version="cv-optimizer-v1.0",
            gpu_utilization=self._get_gpu_utilization() if self.device == "cuda" else None,
            memory_usage_mb=self._get_memory_usage(),
            confidence_score=avg_confidence,
            timestamp=datetime.now()
        )
        
        self.performance_metrics.append(metrics)
        
        # Keep only last 1000 metrics
        if len(self.performance_metrics) > 1000:
            self.performance_metrics = self.performance_metrics[-1000:]
        
        # Alert if performance degrades
        if inference_time > 2000:  # >2s target
            logger.warning(f"Inference time exceeded target: {inference_time:.1f}ms")
    
    def _get_gpu_utilization(self) -> Optional[float]:
        """Get GPU utilization if available"""
        try:
            if torch.cuda.is_available():
                return torch.cuda.utilization()
        except:
            pass
        return None
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        try:
            if self.device == "cuda":
                return torch.cuda.memory_allocated() / (1024 * 1024)
            else:
                import psutil
                return psutil.Process().memory_info().rss / (1024 * 1024)
        except:
            return 0.0
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        if not self.performance_metrics:
            return {}
        
        recent_metrics = self.performance_metrics[-100:]  # Last 100 inferences
        
        inference_times = [m.inference_time_ms for m in recent_metrics]
        confidence_scores = [m.confidence_score for m in recent_metrics]
        
        return {
            "avg_inference_time_ms": np.mean(inference_times),
            "p95_inference_time_ms": np.percentile(inference_times, 95),
            "p99_inference_time_ms": np.percentile(inference_times, 99),
            "avg_confidence": np.mean(confidence_scores),
            "total_requests": len(self.performance_metrics),
            "cache_hit_rate": sum(1 for m in recent_metrics if hasattr(m, 'cache_hit')) / len(recent_metrics),
            "device": self.device,
            "model_version": "cv-optimizer-v1.0"
        }


# FastAPI application
app = FastAPI(
    title="CVPerfect ML Inference Server",
    description="High-performance CV optimization API with <2s response time",
    version="1.0.0"
)

# CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global inference server instance
inference_server = None


@app.on_event("startup")
async def startup_event():
    """Initialize inference server on startup"""
    global inference_server
    
    logger.info("Starting CVPerfect ML Inference Server...")
    inference_server = CVInferenceServer()
    logger.info("Inference server ready!")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CVPerfect ML Inference Server",
        "version": "1.0.0",
        "device": inference_server.device if inference_server else "unknown"
    }


@app.get("/performance")
async def get_performance_metrics():
    """Get inference performance statistics"""
    if not inference_server:
        raise HTTPException(status_code=503, detail="Inference server not ready")
    
    stats = inference_server.get_performance_stats()
    return {
        "status": "success",
        "metrics": stats,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/optimize", response_model=CVOptimizationResponse)
async def optimize_cv_endpoint(request: CVOptimizationRequest, background_tasks: BackgroundTasks):
    """
    Main CV optimization endpoint
    
    Optimizes CV content using advanced ML models with <2s response time
    """
    if not inference_server:
        raise HTTPException(status_code=503, detail="Inference server not ready")
    
    # Validate input
    if len(request.cv_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="CV text too short (minimum 50 characters)")
    
    if len(request.cv_text) > 50000:
        raise HTTPException(status_code=400, detail="CV text too long (maximum 50,000 characters)")
    
    # Run optimization
    result = await inference_server.optimize_cv(request)
    
    # Background task for analytics (non-blocking)
    background_tasks.add_task(log_inference_analytics, request, result)
    
    return result


@app.post("/batch-optimize")
async def batch_optimize_cvs(requests: List[CVOptimizationRequest]):
    """
    Batch CV optimization endpoint
    
    Optimizes multiple CVs in a single request for efficiency
    """
    if not inference_server:
        raise HTTPException(status_code=503, detail="Inference server not ready")
    
    if len(requests) > inference_server.max_batch_size:
        raise HTTPException(
            status_code=400, 
            detail=f"Batch size too large (maximum {inference_server.max_batch_size})"
        )
    
    results = []
    for request in requests:
        result = await inference_server.optimize_cv(request)
        results.append(result)
    
    return {"results": results, "batch_size": len(requests)}


def log_inference_analytics(request: CVOptimizationRequest, response: CVOptimizationResponse):
    """Log inference analytics for monitoring (background task)"""
    try:
        analytics_data = {
            "timestamp": datetime.now().isoformat(),
            "plan": request.plan,
            "language": request.language,
            "cv_length": len(request.cv_text),
            "has_job_description": request.job_description is not None,
            "ats_score": response.ats_score,
            "primary_industry": response.industry_classification["primary_industry"],
            "inference_time_ms": response.performance_metrics.get("inference_time_ms", 0),
            "confidence_avg": sum(response.confidence_scores.values()) / len(response.confidence_scores)
        }
        
        # In production: send to analytics service
        logger.info(f"Analytics: {analytics_data}")
        
    except Exception as e:
        logger.error(f"Analytics logging failed: {e}")


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "model_server:app",
        host="0.0.0.0",
        port=8001,
        reload=False,  # Disable reload for production
        workers=1,     # Single worker for GPU memory efficiency
        log_level="info"
    )