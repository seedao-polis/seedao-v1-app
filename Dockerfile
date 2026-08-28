# syntax=docker/dockerfile:1

# CRA SPA (react-app-rewired) → nginx (port 3000, matches host reverse-proxy pattern)

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json .npmrc ./
# husky / native build not needed for production build
ENV HUSKY=0
ENV CI=false
# Align with netlify.toml / local .npmrc (legacy-peer-deps, official registry for @seedao2.0)
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
ENV NODE_OPTIONS=--max-old-space-size=6144
# postinstall needs scripts/ — skip lifecycle hooks until source is copied
RUN npm ci --ignore-scripts
COPY . .
RUN node scripts/link-react-google-calendar-locale.js
ENV REACT_APP_ENV_VERSION=prod
ENV REACT_APP_API_VERSION=v1
RUN npm run build:online

FROM nginx:1.27-alpine AS runner
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
