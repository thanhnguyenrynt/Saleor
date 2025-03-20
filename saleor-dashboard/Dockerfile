FROM node:20-alpine as builder
RUN apk --no-cache add bash
WORKDIR /app
COPY package*.json ./
ENV CI 1
RUN npm ci --legacy-peer-deps

COPY nginx/ nginx/
COPY assets/ assets/
COPY locale/ locale/
COPY scripts/ scripts/
COPY vite.config.js ./
COPY tsconfig.json ./
COPY *.d.ts ./
COPY schema.graphql ./
COPY introspection.json ./
COPY introspection*.json ./
COPY .featureFlags/ .featureFlags/

COPY src/ src/

ARG API_URL
ARG APP_MOUNT_URI
ARG APPS_MARKETPLACE_API_URL
ARG APPS_TUNNEL_URL_KEYWORDS
ARG STATIC_URL
ARG SKIP_SOURCEMAPS
ARG LOCALE_CODE

ENV API_URL="https://saleor-api.fly.dev/graphql/"
ENV APP_MOUNT_URI="/"
ENV APPS_MARKETPLACE_API_URL="https://apps.saleor.io/api/v2/saleor-apps"
ENV APPS_TUNNEL_URL_KEYWORDS=""
ENV STATIC_URL="/"
ENV SKIP_SOURCEMAPS="true"
ENV LOCALE_CODE="EN"
ENV PORT=8080
ENV HOST="0.0.0.0"
RUN npm run build

FROM nginx:stable-alpine as runner
WORKDIR /app

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/replace-env-vars.sh /docker-entrypoint.d/50-replace-env-vars.sh
COPY --from=builder /app/build/ /app/

LABEL \
  org.opencontainers.image.title="saleor/saleor-dashboard" \
  org.opencontainers.image.description="A GraphQL-powered, single-page dashboard application for Saleor." \
  org.opencontainers.image.url="https://saleor.io/" \
  org.opencontainers.image.source="https://github.com/saleor/saleor-dashboard" \
  org.opencontainers.image.revision="$COMMIT_ID" \
  org.opencontainers.image.version="$PROJECT_VERSION" \
  org.opencontainers.image.authors="Saleor Commerce (https://saleor.io)" \
  org.opencontainers.image.licenses="BSD 3"
