FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if needed later, keep minimal for now)
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the Flask port
EXPOSE 5002

# Environment for Python and Flask
ENV PYTHONUNBUFFERED=1 \
    FLASK_ENV=production

# Run the app
CMD ["python", "app.py"]

