# Dockerfile for AWS App Runner or containerized deployment
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY src/ ./src/
COPY migrations/ ./migrations/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
