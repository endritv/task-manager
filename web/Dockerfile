# Base: shared node deps
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Local: Vite dev server with HMR
FROM base AS local
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build: compile assets
FROM base AS builder
COPY . .
RUN npm run build

# Staging: nginx with built assets
FROM nginx:alpine AS staging
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/staging.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Production: nginx hardened
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
EXPOSE 80
