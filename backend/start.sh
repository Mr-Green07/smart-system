#!/bin/bash

# SmartSystem Backend Startup Script
# Starts all components: Server 1, Server 2, and Load Balancer

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   SmartSystem Backend Startup Script       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update it with your configuration."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting SmartSystem Backend..."
echo ""
echo "📝 Services to be started:"
echo "   • Server 1   : port 3001"
echo "   • Server 2   : port 3002"
echo "   • Load Balancer: port 4000"
echo ""
echo "💡 Tip: Open 3 different terminals and run:"
echo "   Terminal 1: npm run server1"
echo "   Terminal 2: npm run server2"
echo "   Terminal 3: npm run load-balancer"
echo ""
echo "📊 Or run all together:"
echo "   npm run start-all"
echo ""
