#!/bin/bash
# Shell script to create deployment ZIP for Elastic Beanstalk Console
# Run this from the project root

echo "Building TypeScript..."
cd server
npm run build

echo "Creating deployment package..."
cd ..

# Create ZIP excluding unnecessary files
zip -r server-deploy.zip server/ \
  -x "server/node_modules/*" \
  -x "server/.git/*" \
  -x "server/*.db" \
  -x "server/*.log" \
  -x "server/.env*" \
  -x "server/dist/*" \
  -x "*.DS_Store"

echo ""
echo "Deployment package created: server-deploy.zip"
echo ""
echo "Next steps:"
echo "1. Go to AWS Elastic Beanstalk Console"
echo "2. Select your environment"
echo "3. Click 'Upload and deploy'"
echo "4. Upload server-deploy.zip"
echo "5. Add a version label and deploy"
