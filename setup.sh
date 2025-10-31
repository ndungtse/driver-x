#!/bin/bash

set -e

echo "🚀 Setting up Driver Tracker..."

echo "📦 Setting up server dependencies..."
cd server
if command -v uv &> /dev/null; then
    uv sync
    echo "✅ Server dependencies installed"
else
    echo "❌ Error: uv is not installed. Please install it from https://github.com/astral-sh/uv"
    exit 1
fi

echo "📦 Running server migrations..."
uv run python manage.py migrate

echo "📦 Setting up client dependencies..."
cd ../client
if command -v pnpm &> /dev/null; then
    pnpm install
    echo "✅ Client dependencies installed"
elif command -v npm &> /dev/null; then
    npm install
    echo "✅ Client dependencies installed (using npm)"
else
    echo "❌ Error: pnpm or npm is not installed"
    exit 1
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "To start both servers, run:"
echo "  npm run dev"

