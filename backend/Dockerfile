# syntax=docker/dockerfile:1.6
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first for better caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel && pip install -r requirements.txt

# Copy project
COPY backend /app

# Create non-root user and ensure dirs exist
RUN useradd -m -u 10001 appuser \
  && mkdir -p /app/staticfiles /app/media \
  && chown -R appuser:appuser /app

# Entrypoint
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]