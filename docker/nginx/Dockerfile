# syntax=docker/dockerfile:1.6

# Build the React (Vite) frontend
FROM node:20-bullseye AS frontend
# Set the working directory for the frontend build
WORKDIR /app
# Copy package files directly into /app
COPY frontend/package*.json ./
# Install dependencies
RUN npm ci
# Copy the entire frontend directory contents into /app
COPY frontend/ ./
# Set build-time env var
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}
# Run the build from the correct root
RUN npm run build

# Final Nginx image
FROM nginx:1.27-alpine

# Nginx config
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from the correct location
# The build output is now in /app/dist
# MODIFIED: Added a trailing slash to /app/dist/ to copy its contents
COPY --from=frontend /app/dist/ /usr/share/nginx/html

# Static and media will be mounted as read-only volumes at /var/www/static and /var/www/media
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]