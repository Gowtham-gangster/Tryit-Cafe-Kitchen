# Multi-stage Dockerfile for TryIt Cafe Frontend
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /workspace

# Install dependencies with lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Build production Vite bundle
COPY . .
# Build arguments for build-time environment variables if needed
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_WHATSAPP_NUMBER
ARG VITE_SUPPORT_EMAIL
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER} \
    VITE_SUPPORT_EMAIL=${VITE_SUPPORT_EMAIL} \
    VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

RUN npm run build

# Runtime Stage (Nginx Alpine)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default assets
RUN rm -rf ./*

# Copy built dist files
COPY --from=builder /workspace/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
