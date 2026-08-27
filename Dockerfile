# syntax=docker/dockerfile:1

# CRA SPA (react-app-rewired) → nginx (port 3000, matches host reverse-proxy pattern)

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# husky / native build not needed for production build
ENV HUSKY=0
ENV CI=false
RUN npm ci
COPY . .
ENV REACT_APP_ENV_VERSION=prod
RUN npm run build:online

FROM nginx:1.27-alpine AS runner
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
