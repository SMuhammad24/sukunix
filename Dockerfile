# ==============================================================================
# SUKUNIX ENTERPRISE MULTI-STAGE DOCKERFILE FOR AWS DEPLOYMENT
# Compatible with: AWS App Runner, AWS ECS (Fargate), AWS Elastic Beanstalk, EC2
# ==============================================================================

# --- Stage 1: Build Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sukunix

# Copy dependencies and application source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=sukunix:nodejs . .

# Create data and logs directories with proper ownership
RUN mkdir -p /app/data /app/logs && \
    chown -R sukunix:nodejs /app/data /app/logs

# Switch to unprivileged user
USER sukunix

# Expose server port
EXPOSE 3000

# Health check probe for AWS Load Balancer / ECS
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
