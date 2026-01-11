#!/bin/bash
# Elastic Beanstalk postdeploy hook
# Build TypeScript

cd /var/app/current
npm run build
