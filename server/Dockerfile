FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy pyproject.toml, uv.lock, and README.md for dependency installation
COPY pyproject.toml uv.lock README.md ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Create entrypoint script to run migrations before starting server
RUN echo '#!/bin/bash\nset -e\nuv run python manage.py migrate\nexec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Run migrations and start Django development server
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
