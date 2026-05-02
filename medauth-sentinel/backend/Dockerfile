FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project into container
COPY . .

# Create data directory in case it doesn't exist
RUN mkdir -p data

# Expose default port for documentation purposes
EXPOSE 8000

# IMPORTANT: Use ${PORT:-8000} not hardcoded 8000
# Render assigns a dynamic $PORT — this handles both cases:
# - On Render: uses the assigned $PORT
# - Local Docker: falls back to 8000
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
