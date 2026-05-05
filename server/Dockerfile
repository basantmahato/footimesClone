# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer-cache friendly)
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Add tini for proper PID 1 / signal handling
RUN apk add --no-cache tini

WORKDIR /app

# Copy installed node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Drop root privileges – run as the built-in node user
USER node

# Expose the port your app listens on (matches process.env.PORT || 5000)
EXPOSE 5000

# Use tini as the init process so SIGTERM is handled cleanly
ENTRYPOINT ["/sbin/tini", "--"]

# "start" script runs: node server.js
CMD ["node", "server.js"]
