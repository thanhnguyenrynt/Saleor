FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Add python, build tools and Cairo dependencies for canvas
RUN apk add --no-cache libc6-compat python3 make g++ \
    cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev

WORKDIR /app

# Get PNPM version from package.json
COPY package.json pnpm-lock.yaml ./
RUN npm install -g jq && export PNPM_VERSION=$(cat package.json | jq -r '.engines.pnpm' | sed -E 's/[^0-9.]//g')
RUN npm install -g pnpm@$PNPM_VERSION

# Force canvas to use skia
ENV CANVAS_FORCE_SKIA=1

# Install dependencies
RUN pnpm i --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_OUTPUT=standalone
ARG NEXT_PUBLIC_SALEOR_API_URL
ENV NEXT_PUBLIC_SALEOR_API_URL=https://saleor-api.fly.dev/graphql/
ARG NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_STOREFRONT_URL=https://saleor-storefront.fly.dev

# Install build dependencies for canvas in builder stage as well
RUN apk add --no-cache python3 make g++ \
    cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev

# Force canvas to use skia in builder stage
ENV CANVAS_FORCE_SKIA=1

RUN npm install -g jq && export PNPM_VERSION=$(cat package.json | jq -r '.engines.pnpm' | sed -E 's/[^0-9.]//g')
RUN npm install -g pnpm@$PNPM_VERSION
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_SALEOR_API_URL
ENV NEXT_PUBLIC_SALEOR_API_URL=${NEXT_PUBLIC_SALEOR_API_URL}
ARG NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_STOREFRONT_URL=${NEXT_PUBLIC_STOREFRONT_URL}

# Add runtime libraries needed by canvas
RUN apk add --no-cache cairo jpeg pango giflib pixman pangomm libjpeg-turbo freetype

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

CMD ["node", "server.js"]