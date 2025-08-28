# CVPerfect ML Inference Server - Production Docker Image
# Optimized for GPU acceleration with fallback to CPU

FROM nvidia/cuda:12.0-runtime-ubuntu22.04 as gpu-base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1001 cvperfect
WORKDIR /app

# Install Python dependencies
COPY ml_system/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY ml_system/ ./
COPY cvperfect_py/ ./cvperfect_py/

# Set permissions
RUN chown -R cvperfect:cvperfect /app
USER cvperfect

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV CUDA_VISIBLE_DEVICES=0

# Expose port
EXPOSE 8001

# Production startup command with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--timeout", "120", "--preload", "--max-requests", "1000", "--max-requests-jitter", "100", "inference.model_server:app"]

# Multi-stage build for CPU-only fallback
FROM python:3.10-slim as cpu-base

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 cvperfect
WORKDIR /app

COPY ml_system/requirements-cpu.txt .
RUN pip install --no-cache-dir -r requirements-cpu.txt

COPY ml_system/ ./
COPY cvperfect_py/ ./cvperfect_py/

RUN chown -R cvperfect:cvperfect /app
USER cvperfect

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8001

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "2", "--worker-class", "uvicorn.workers.UvicornWorker", "--timeout", "60", "--preload", "inference.model_server:app"]