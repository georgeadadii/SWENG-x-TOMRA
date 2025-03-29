# Use official Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the .env file (make sure it exists in your build context)
COPY .env /app/.env

# Copy backend source code
COPY backend/ .

# Expose the backend port
EXPOSE 8000

# Start the backend (modify if your app entry point isn't main.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
