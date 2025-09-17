#!/bin/bash

# Prompty Development Startup Script

echo "🚀 Starting Prompty Development Environment..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/env.example backend/.env
    echo "📝 Please update backend/.env with your MongoDB Atlas connection string and JWT secret"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from example..."
    cp frontend/env.example frontend/.env
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "1. Update backend/.env with your MongoDB Atlas connection string"
echo "2. Run: cd backend && npm run dev (in one terminal)"
echo "3. Run: cd frontend && npm run dev (in another terminal)"
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:5173"
