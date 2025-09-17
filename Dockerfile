FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source and config files
COPY . .

# Build the application and generate Prisma client
RUN npx tsc -p tsconfig.json && npx prisma generate

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]