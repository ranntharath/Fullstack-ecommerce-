# ==========================================
# STAGE 1: The Builder (Heavy lifting)
# ==========================================
FROM python:3.11-slim AS builder

# Prevent Python from writing .pyc files and force unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system tools needed to COMPILE Python packages (like psycopg2 or cryptography)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a isolated virtual environment to hold our compiled packages
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and compile them inside the virtual environment
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ==========================================
# STAGE 2: The Runner (Lean & Secure)
# ==========================================
FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Force the container to use the virtual environment we copy over
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Install ONLY the bare minimum runtime libraries needed to run the app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-compiled virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy your actual Django source code
COPY . .

# Security: Create a non-root user and give them ownership of the app files
RUN mkdir -p /app/staticfiles /app/media && useradd -m django && chown -R django:django /app
USER django

EXPOSE 8000

# Use Gunicorn instead of 'runserver' for production traffic
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "setting.wsgi:application"]