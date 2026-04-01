#!/bin/bash
set -e

cd ~/inf1005-web-sys

echo "📥 Pulling latest changes..."
git pull

echo "🐳 Rebuilding containers..."
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "⏳ Waiting for app to start..."
sleep 5

echo "🔍 Health check..."
curl -f http://localhost || { echo "❌ Health check failed!"; exit 1; }

echo "✅ Deployment complete and healthy."
