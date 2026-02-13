# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
RUN rm -rf .git

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV BASE_PATH=/

# Install tini for proper signal handling
RUN apk add --no-cache tini git

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY . /_examples/smart-git-blame

# Set ownership
RUN chown -R nextjs:nodejs /app /_examples

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
