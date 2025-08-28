"""
CVPerfect ML System - A/B Testing Framework
Advanced A/B testing system for ML model validation and optimization
"""

import asyncio
import json
import logging
import hashlib
import random
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import numpy as np
from pathlib import Path
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import statistics
from scipy import stats

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelType(Enum):
    """Model types for A/B testing"""
    CUSTOM_ML = "custom_ml"
    GROQ_BASELINE = "groq_baseline"
    EXPERIMENTAL = "experimental"


class TestStatus(Enum):
    """A/B test status"""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class ABTestConfig:
    """A/B test configuration"""
    test_id: str
    name: str
    description: str
    models: Dict[str, Dict[str, Any]]  # model_id -> config
    traffic_allocation: Dict[str, float]  # model_id -> percentage (0-1)
    success_metrics: List[str]
    minimum_sample_size: int
    statistical_significance_level: float  # p-value threshold
    max_duration_days: int
    target_segments: Optional[Dict[str, Any]]  # user segments to target
    created_at: datetime
    
    def __post_init__(self):
        """Validate configuration"""
        # Check traffic allocation sums to 1.0
        total_traffic = sum(self.traffic_allocation.values())
        if not (0.99 <= total_traffic <= 1.01):  # Allow small floating point errors
            raise ValueError(f"Traffic allocation must sum to 1.0, got {total_traffic}")
        
        # Check models exist in allocation
        for model_id in self.traffic_allocation:
            if model_id not in self.models:
                raise ValueError(f"Model {model_id} in allocation but not in models config")


@dataclass
class ABTestResult:
    """Single A/B test result"""
    test_id: str
    session_id: str
    user_id: Optional[str]
    model_assigned: str
    model_version: str
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]
    metrics: Dict[str, float]
    user_feedback: Optional[Dict[str, Any]]
    timestamp: datetime
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['request_data'] = json.dumps(data['request_data'])
        data['response_data'] = json.dumps(data['response_data'])
        data['metrics'] = json.dumps(data['metrics'])
        data['user_feedback'] = json.dumps(data['user_feedback']) if data['user_feedback'] else None
        return data


@dataclass
class TestStatistics:
    """Statistical analysis results for A/B test"""
    test_id: str
    model_performance: Dict[str, Dict[str, float]]  # model -> metrics
    statistical_significance: Dict[str, Dict[str, float]]  # metric -> model comparisons
    confidence_intervals: Dict[str, Dict[str, Tuple[float, float]]]
    sample_sizes: Dict[str, int]
    conversion_rates: Dict[str, float]
    recommendation: str
    p_values: Dict[str, float]
    effect_sizes: Dict[str, float]
    calculated_at: datetime


class ABTestManager:
    """Advanced A/B testing manager for ML models"""
    
    def __init__(self, db_path: str = "ml_system/data/ab_tests.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # Active tests cache
        self.active_tests: Dict[str, ABTestConfig] = {}
        self._load_active_tests()
        
        # Random state for consistent assignment
        self.random_state = random.Random()
        
        logger.info(f"AB Test Manager initialized with {len(self.active_tests)} active tests")
    
    def _init_database(self):
        """Initialize SQLite database for A/B testing"""
        
        with sqlite3.connect(self.db_path) as conn:
            # A/B test configurations
            conn.execute("""
                CREATE TABLE IF NOT EXISTS ab_tests (
                    test_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    models TEXT,  -- JSON
                    traffic_allocation TEXT,  -- JSON
                    success_metrics TEXT,  -- JSON
                    minimum_sample_size INTEGER,
                    significance_level REAL,
                    max_duration_days INTEGER,
                    target_segments TEXT,  -- JSON
                    status TEXT,
                    created_at TEXT,
                    started_at TEXT,
                    ended_at TEXT
                )
            """)
            
            # A/B test results
            conn.execute("""
                CREATE TABLE IF NOT EXISTS ab_test_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_id TEXT,
                    session_id TEXT,
                    user_id TEXT,
                    model_assigned TEXT,
                    model_version TEXT,
                    request_data TEXT,  -- JSON
                    response_data TEXT,  -- JSON
                    metrics TEXT,  -- JSON
                    user_feedback TEXT,  -- JSON
                    timestamp TEXT,
                    FOREIGN KEY (test_id) REFERENCES ab_tests (test_id)
                )
            """)
            
            # A/B test statistics
            conn.execute("""
                CREATE TABLE IF NOT EXISTS ab_test_statistics (
                    test_id TEXT PRIMARY KEY,
                    model_performance TEXT,  -- JSON
                    statistical_significance TEXT,  -- JSON
                    confidence_intervals TEXT,  -- JSON
                    sample_sizes TEXT,  -- JSON
                    conversion_rates TEXT,  -- JSON
                    recommendation TEXT,
                    p_values TEXT,  -- JSON
                    effect_sizes TEXT,  -- JSON
                    calculated_at TEXT,
                    FOREIGN KEY (test_id) REFERENCES ab_tests (test_id)
                )
            """)
            
            # Create indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results ON ab_test_results(test_id, timestamp)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_session_results ON ab_test_results(session_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_model_results ON ab_test_results(model_assigned)")
    
    def _load_active_tests(self):
        """Load active tests from database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT * FROM ab_tests WHERE status = 'running'
                """)
                
                for row in cursor.fetchall():
                    test_data = dict(zip([col[0] for col in cursor.description], row))
                    
                    # Parse JSON fields
                    test_data['models'] = json.loads(test_data['models'])
                    test_data['traffic_allocation'] = json.loads(test_data['traffic_allocation'])
                    test_data['success_metrics'] = json.loads(test_data['success_metrics'])
                    test_data['target_segments'] = json.loads(test_data['target_segments']) if test_data['target_segments'] else None
                    test_data['created_at'] = datetime.fromisoformat(test_data['created_at'])
                    
                    config = ABTestConfig(**{k: v for k, v in test_data.items() 
                                           if k in ABTestConfig.__dataclass_fields__})
                    
                    self.active_tests[config.test_id] = config
                    
        except Exception as e:
            logger.error(f"Failed to load active tests: {e}")
    
    def create_test(self, config: ABTestConfig) -> str:
        """Create new A/B test"""
        
        try:
            # Validate configuration
            config.__post_init__()
            
            # Store in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO ab_tests (
                        test_id, name, description, models, traffic_allocation,
                        success_metrics, minimum_sample_size, significance_level,
                        max_duration_days, target_segments, status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    config.test_id, config.name, config.description,
                    json.dumps(config.models), json.dumps(config.traffic_allocation),
                    json.dumps(config.success_metrics), config.minimum_sample_size,
                    config.statistical_significance_level, config.max_duration_days,
                    json.dumps(config.target_segments) if config.target_segments else None,
                    TestStatus.DRAFT.value, config.created_at.isoformat()
                ))
            
            logger.info(f"Created A/B test: {config.test_id}")
            return config.test_id
            
        except Exception as e:
            logger.error(f"Failed to create test {config.test_id}: {e}")
            raise
    
    def start_test(self, test_id: str) -> bool:
        """Start A/B test"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Update status and start time
                conn.execute("""
                    UPDATE ab_tests 
                    SET status = ?, started_at = ?
                    WHERE test_id = ?
                """, (TestStatus.RUNNING.value, datetime.now().isoformat(), test_id))
                
                if conn.total_changes == 0:
                    return False
            
            # Reload active tests
            self._load_active_tests()
            
            logger.info(f"Started A/B test: {test_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start test {test_id}: {e}")
            return False
    
    def assign_model(self, session_id: str, user_context: Optional[Dict] = None) -> Optional[str]:
        """Assign model to user based on A/B test configuration"""
        
        if not self.active_tests:
            return None
        
        try:
            # For simplicity, use the first active test
            # In production, you might have test selection logic
            test = next(iter(self.active_tests.values()))
            
            # Check if user matches target segments
            if test.target_segments and user_context:
                if not self._matches_target_segments(user_context, test.target_segments):
                    return None
            
            # Deterministic assignment based on session_id
            # This ensures consistent assignment across requests
            assignment_hash = hashlib.md5(
                f"{test.test_id}:{session_id}".encode()
            ).hexdigest()
            
            # Convert hash to float 0-1
            assignment_value = int(assignment_hash[:8], 16) / (16**8)
            
            # Assign based on traffic allocation
            cumulative_allocation = 0.0
            for model_id, allocation in test.traffic_allocation.items():
                cumulative_allocation += allocation
                if assignment_value <= cumulative_allocation:
                    logger.debug(f"Assigned session {session_id} to model {model_id}")
                    return model_id
            
            # Fallback to first model
            return next(iter(test.traffic_allocation.keys()))
            
        except Exception as e:
            logger.error(f"Model assignment failed for session {session_id}: {e}")
            return None
    
    def _matches_target_segments(self, user_context: Dict, target_segments: Dict) -> bool:
        """Check if user matches target segments"""
        
        # Example segment matching logic
        for segment_key, segment_value in target_segments.items():
            user_value = user_context.get(segment_key)
            
            if isinstance(segment_value, list):
                if user_value not in segment_value:
                    return False
            else:
                if user_value != segment_value:
                    return False
        
        return True
    
    def record_result(self, result: ABTestResult):
        """Record A/B test result"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                data = result.to_dict()
                conn.execute("""
                    INSERT INTO ab_test_results (
                        test_id, session_id, user_id, model_assigned, model_version,
                        request_data, response_data, metrics, user_feedback, timestamp
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data['test_id'], data['session_id'], data['user_id'],
                    data['model_assigned'], data['model_version'],
                    data['request_data'], data['response_data'],
                    data['metrics'], data['user_feedback'], data['timestamp']
                ))
            
            logger.debug(f"Recorded result for test {result.test_id}, session {result.session_id}")
            
        except Exception as e:
            logger.error(f"Failed to record result: {e}")
    
    def get_test_results(self, test_id: str, limit: Optional[int] = None) -> List[ABTestResult]:
        """Get results for specific test"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                query = """
                    SELECT * FROM ab_test_results 
                    WHERE test_id = ?
                    ORDER BY timestamp DESC
                """
                params = [test_id]
                
                if limit:
                    query += " LIMIT ?"
                    params.append(limit)
                
                cursor.execute(query, params)
                
                results = []
                for row in cursor.fetchall():
                    data = dict(zip([col[0] for col in cursor.description], row))
                    
                    # Parse JSON fields
                    data['request_data'] = json.loads(data['request_data'])
                    data['response_data'] = json.loads(data['response_data'])
                    data['metrics'] = json.loads(data['metrics'])
                    data['user_feedback'] = json.loads(data['user_feedback']) if data['user_feedback'] else None
                    data['timestamp'] = datetime.fromisoformat(data['timestamp'])
                    
                    # Remove id field for ABTestResult
                    del data['id']
                    
                    results.append(ABTestResult(**data))
                
                return results
                
        except Exception as e:
            logger.error(f"Failed to get test results for {test_id}: {e}")
            return []
    
    def analyze_test(self, test_id: str) -> Optional[TestStatistics]:
        """Perform statistical analysis of A/B test"""
        
        try:
            results = self.get_test_results(test_id)
            
            if not results:
                logger.warning(f"No results found for test {test_id}")
                return None
            
            # Group results by model
            model_results = {}
            for result in results:
                model_id = result.model_assigned
                if model_id not in model_results:
                    model_results[model_id] = []
                model_results[model_id].append(result)
            
            # Calculate performance metrics
            model_performance = {}
            sample_sizes = {}
            
            for model_id, model_data in model_results.items():
                sample_sizes[model_id] = len(model_data)
                
                # Calculate mean metrics
                metrics_sums = {}
                for result in model_data:
                    for metric_name, metric_value in result.metrics.items():
                        if metric_name not in metrics_sums:
                            metrics_sums[metric_name] = []
                        metrics_sums[metric_name].append(metric_value)
                
                model_performance[model_id] = {}
                for metric_name, values in metrics_sums.items():
                    model_performance[model_id][metric_name] = {
                        'mean': statistics.mean(values),
                        'std': statistics.stdev(values) if len(values) > 1 else 0.0,
                        'count': len(values)
                    }
            
            # Statistical significance testing
            statistical_significance = {}
            p_values = {}
            effect_sizes = {}
            confidence_intervals = {}
            
            # Compare each metric between models
            test_config = self.active_tests.get(test_id)
            if test_config:
                success_metrics = test_config.success_metrics
            else:
                # Use all available metrics
                success_metrics = list(next(iter(model_performance.values())).keys())
            
            models = list(model_performance.keys())
            
            for metric_name in success_metrics:
                if metric_name not in statistical_significance:
                    statistical_significance[metric_name] = {}
                    confidence_intervals[metric_name] = {}
                
                for i, model_a in enumerate(models):
                    for model_b in models[i+1:]:
                        
                        # Get metric values for both models
                        values_a = [r.metrics[metric_name] for r in model_results[model_a] 
                                  if metric_name in r.metrics]
                        values_b = [r.metrics[metric_name] for r in model_results[model_b] 
                                  if metric_name in r.metrics]
                        
                        if len(values_a) < 2 or len(values_b) < 2:
                            continue
                        
                        # Perform t-test
                        t_stat, p_value = stats.ttest_ind(values_a, values_b)
                        
                        comparison_key = f"{model_a}_vs_{model_b}"
                        statistical_significance[metric_name][comparison_key] = {
                            't_statistic': t_stat,
                            'p_value': p_value,
                            'significant': p_value < (test_config.statistical_significance_level if test_config else 0.05)
                        }
                        
                        p_values[comparison_key] = p_value
                        
                        # Calculate effect size (Cohen's d)
                        pooled_std = np.sqrt(
                            ((len(values_a) - 1) * np.var(values_a, ddof=1) +
                             (len(values_b) - 1) * np.var(values_b, ddof=1)) /
                            (len(values_a) + len(values_b) - 2)
                        )
                        effect_size = (np.mean(values_a) - np.mean(values_b)) / pooled_std if pooled_std > 0 else 0
                        effect_sizes[comparison_key] = effect_size
                        
                        # Calculate confidence intervals
                        confidence_intervals[metric_name][model_a] = self._calculate_confidence_interval(values_a)
                        confidence_intervals[metric_name][model_b] = self._calculate_confidence_interval(values_b)
            
            # Generate recommendation
            recommendation = self._generate_recommendation(
                model_performance, statistical_significance, sample_sizes, test_config
            )
            
            # Calculate conversion rates (if applicable)
            conversion_rates = self._calculate_conversion_rates(model_results)
            
            # Create statistics object
            statistics_obj = TestStatistics(
                test_id=test_id,
                model_performance=model_performance,
                statistical_significance=statistical_significance,
                confidence_intervals=confidence_intervals,
                sample_sizes=sample_sizes,
                conversion_rates=conversion_rates,
                recommendation=recommendation,
                p_values=p_values,
                effect_sizes=effect_sizes,
                calculated_at=datetime.now()
            )
            
            # Store statistics in database
            self._store_test_statistics(statistics_obj)
            
            return statistics_obj
            
        except Exception as e:
            logger.error(f"Test analysis failed for {test_id}: {e}")
            return None
    
    def _calculate_confidence_interval(self, values: List[float], confidence: float = 0.95) -> Tuple[float, float]:
        """Calculate confidence interval for values"""
        if len(values) < 2:
            mean_val = values[0] if values else 0
            return (mean_val, mean_val)
        
        mean_val = statistics.mean(values)
        std_err = statistics.stdev(values) / np.sqrt(len(values))
        
        # Use t-distribution for small samples
        if len(values) < 30:
            t_critical = stats.t.ppf((1 + confidence) / 2, len(values) - 1)
        else:
            t_critical = stats.norm.ppf((1 + confidence) / 2)
        
        margin_error = t_critical * std_err
        return (mean_val - margin_error, mean_val + margin_error)
    
    def _calculate_conversion_rates(self, model_results: Dict[str, List[ABTestResult]]) -> Dict[str, float]:
        """Calculate conversion rates by model"""
        conversion_rates = {}
        
        for model_id, results in model_results.items():
            if not results:
                conversion_rates[model_id] = 0.0
                continue
            
            # Define conversion based on user feedback or ATS score improvement
            conversions = 0
            for result in results:
                # Example: consider conversion if ATS score > 80 or positive user feedback
                ats_score = result.metrics.get('ats_score', 0)
                user_rating = result.user_feedback.get('rating') if result.user_feedback else None
                
                if ats_score > 80 or (user_rating and user_rating >= 4):
                    conversions += 1
            
            conversion_rates[model_id] = conversions / len(results)
        
        return conversion_rates
    
    def _generate_recommendation(self, model_performance: Dict, statistical_significance: Dict, 
                               sample_sizes: Dict, test_config: Optional[ABTestConfig]) -> str:
        """Generate recommendation based on test results"""
        
        if not model_performance:
            return "Insufficient data for recommendation"
        
        models = list(model_performance.keys())
        
        if len(models) < 2:
            return f"Only one model tested: {models[0]}"
        
        # Check sample sizes
        min_sample_size = test_config.minimum_sample_size if test_config else 100
        insufficient_samples = [model for model, size in sample_sizes.items() if size < min_sample_size]
        
        if insufficient_samples:
            return f"Insufficient sample sizes for: {', '.join(insufficient_samples)}. Continue test."
        
        # Find best performing model for primary metric
        primary_metric = 'ats_score'  # Assume ATS score is primary
        if primary_metric in next(iter(model_performance.values())):
            best_model = max(models, key=lambda m: model_performance[m][primary_metric]['mean'])
            best_score = model_performance[best_model][primary_metric]['mean']
            
            # Check if improvement is statistically significant
            significant_improvements = []
            for comparison_key, result in statistical_significance.get(primary_metric, {}).items():
                if best_model in comparison_key and result['significant']:
                    other_model = comparison_key.replace(best_model, '').replace('_vs_', '').replace('vs_', '')
                    if other_model:
                        significant_improvements.append(other_model)
            
            if significant_improvements:
                return f"Recommend {best_model}: {best_score:.1f} {primary_metric}, statistically significant improvement over {', '.join(significant_improvements)}"
            else:
                return f"No statistically significant differences found. {best_model} performs best ({best_score:.1f}) but needs more data for significance."
        
        return "Continue test - more data needed for conclusive results"
    
    def _store_test_statistics(self, stats: TestStatistics):
        """Store test statistics in database"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO ab_test_statistics (
                        test_id, model_performance, statistical_significance,
                        confidence_intervals, sample_sizes, conversion_rates,
                        recommendation, p_values, effect_sizes, calculated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    stats.test_id,
                    json.dumps(stats.model_performance),
                    json.dumps(stats.statistical_significance),
                    json.dumps(stats.confidence_intervals),
                    json.dumps(stats.sample_sizes),
                    json.dumps(stats.conversion_rates),
                    stats.recommendation,
                    json.dumps(stats.p_values),
                    json.dumps(stats.effect_sizes),
                    stats.calculated_at.isoformat()
                ))
                
        except Exception as e:
            logger.error(f"Failed to store test statistics: {e}")


def create_cvperfect_ab_test() -> ABTestConfig:
    """Create standard CVPerfect A/B test configuration"""
    
    return ABTestConfig(
        test_id="cvperfect_ml_vs_groq_2025_01",
        name="Custom ML vs Groq Baseline",
        description="Compare custom fine-tuned CV optimizer against Groq Llama 3.1-70B baseline",
        models={
            "custom_ml": {
                "type": ModelType.CUSTOM_ML.value,
                "endpoint": "http://localhost:8001/optimize",
                "version": "cv-optimizer-v1.0",
                "description": "Fine-tuned Llama 3.1-7B for CV optimization"
            },
            "groq_baseline": {
                "type": ModelType.GROQ_BASELINE.value,
                "endpoint": "/api/analyze",  # Existing Groq endpoint
                "version": "llama-3.1-70b",
                "description": "Groq Llama 3.1-70B baseline"
            }
        },
        traffic_allocation={
            "custom_ml": 0.7,      # 70% to custom model
            "groq_baseline": 0.3   # 30% to baseline
        },
        success_metrics=["ats_score", "response_time_ms", "user_satisfaction"],
        minimum_sample_size=500,   # Per model
        statistical_significance_level=0.05,  # p < 0.05
        max_duration_days=14,
        target_segments={
            "plan": ["gold", "premium"]  # Only test on paid users initially
        },
        created_at=datetime.now()
    )


if __name__ == "__main__":
    # Test A/B testing system
    print("🧪 CVPerfect A/B Testing Framework - Testing...")
    
    # Initialize manager
    manager = ABTestManager()
    
    # Create test configuration
    test_config = create_cvperfect_ab_test()
    
    try:
        # Create and start test
        test_id = manager.create_test(test_config)
        success = manager.start_test(test_id)
        
        print(f"✅ A/B Test created and started: {test_id}")
        print(f"📊 Traffic allocation: {test_config.traffic_allocation}")
        
        # Test model assignment
        for i in range(10):
            session_id = f"test_session_{i}"
            assigned_model = manager.assign_model(session_id)
            print(f"   Session {session_id}: {assigned_model}")
        
        # Simulate some test results
        import time
        for i in range(20):
            session_id = f"sim_session_{i}"
            assigned_model = manager.assign_model(session_id)
            
            # Simulate different performance for different models
            if assigned_model == "custom_ml":
                ats_score = random.gauss(85, 10)  # Higher mean
                response_time = random.gauss(1500, 200)  # Faster
            else:
                ats_score = random.gauss(78, 12)  # Lower mean
                response_time = random.gauss(3200, 500)  # Slower
            
            result = ABTestResult(
                test_id=test_id,
                session_id=session_id,
                user_id=f"user_{i}",
                model_assigned=assigned_model,
                model_version="1.0",
                request_data={"cv_length": random.randint(500, 2000)},
                response_data={"optimized": True},
                metrics={
                    "ats_score": max(0, min(100, ats_score)),
                    "response_time_ms": max(500, response_time),
                    "user_satisfaction": random.choice([3, 4, 5])
                },
                user_feedback={"rating": random.choice([3, 4, 5])},
                timestamp=datetime.now()
            )
            
            manager.record_result(result)
        
        # Analyze results
        print("\n📈 Analyzing test results...")
        stats = manager.analyze_test(test_id)
        
        if stats:
            print(f"📊 Sample sizes: {stats.sample_sizes}")
            print(f"💯 Conversion rates: {stats.conversion_rates}")
            print(f"🎯 Recommendation: {stats.recommendation}")
            print(f"📈 P-values: {stats.p_values}")
        
        print("✅ A/B Testing Framework test completed successfully!")
        
    except Exception as e:
        print(f"❌ A/B Testing test failed: {e}")
        logger.error(f"Test failed: {e}", exc_info=True)