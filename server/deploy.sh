#!/bin/bash
# Deployment script for Elastic Beanstalk

echo "Building TypeScript..."
npm run build

echo "Creating deployment package..."
cd ..
zip -r server.zip server/ -x "server/node_modules/*" "server/.git/*" "server/*.db" "server/*.log" "server/.env*"

echo "Deployment package created: server.zip"
echo "Upload this to Elastic Beanstalk or use EB CLI:"
echo "  eb deploy"
