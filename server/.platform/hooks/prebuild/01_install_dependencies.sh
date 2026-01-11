#!/bin/bash
# Elastic Beanstalk prebuild hook
# Install dependencies

cd /var/app/staging
npm install --production
