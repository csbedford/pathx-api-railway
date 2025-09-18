FROM node:20-alpine

# Install OpenSSL for Prisma engines
RUN apk add --no-cache openssl libssl3

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source and config files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Create startup script that runs migrations and then starts the app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Start the application using the entrypoint script
CMD ["./docker-entrypoint.sh"]