FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optional: build tools if you have dependencies like numpy, pandas etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Set environment variables for Gunicorn optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Gunicorn configuration
    GUNICORN_WORKERS=${GUNICORN_WORKERS:-2} \
    GUNICORN_THREADS=${GUNICORN_THREADS:-4} \
    GUNICORN_WORKER_CLASS=${GUNICORN_WORKER_CLASS:-uvicorn.workers.UvicornWorker} \
    GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-120} \
    GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5} \
    GUNICORN_MAX_REQUESTS=${GUNICORN_MAX_REQUESTS:-1000} \
    GUNICORN_MAX_REQUESTS_JITTER=${GUNICORN_MAX_REQUESTS_JITTER:-50}

# Expose the port FastAPI runs on
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set the entrypoint
CMD ["./start.sh"]