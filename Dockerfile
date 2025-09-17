FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source and config files
COPY . .

# Install dev dependencies and build
RUN npm install && npm run build && npm run prisma:generate

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]