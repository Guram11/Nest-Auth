# Stage 1: Build the NestJS app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Development environment
FROM node:20-alpine AS development

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app ./

# Install all dependencies for development
RUN npm install

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set environment variable
ENV NODE_ENV=development

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Stage 3: Production environment
FROM node:20-alpine AS production

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app ./

# Install only production dependencies
RUN npm install --only=production

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set environment variable
ENV NODE_ENV=production

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]