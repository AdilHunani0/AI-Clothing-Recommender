#!/bin/bash

echo "🚀 Starting Fashion Style Analyzer Server"
echo "=========================================="

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Install required packages
echo "📦 Installing required packages..."
pip install flask flask-cors pymongo opencv-python mediapipe numpy pandas joblib

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
python -c "
from pymongo import MongoClient
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    client.server_info()
    print('✅ MongoDB is running')
except:
    print('❌ MongoDB is not running. Please start MongoDB first.')
    exit(1)
"

# Start the Flask server
echo "🌟 Starting Flask server on port 5001..."
python app.py
