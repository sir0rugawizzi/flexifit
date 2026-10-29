# Multi-stage Dockerfile for FlexiFit
# Builds Vite client PWA and serves from Express backend

FROM node:22-alpine AS builder

WORKDIR /app

# Build frontend
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Production image
FROM node:22-alpine

# better-sqlite3 requires python3 and build tools on alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source code and built frontend dist
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

# Ensure uploads directory exists
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/src/index.js"]
