# Multi-stage Build für ChatGLM Web Application
FROM node:18-alpine AS frontend-builder

# Frontend Build Stage
WORKDIR /app

# Package.json kopieren und Dependencies installieren
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Frontend Source kopieren und builden
COPY src/components/ ./src/components/
COPY src/context/ ./src/context/
COPY src/hooks/ ./src/hooks/
COPY src/lib/ ./src/lib/
COPY src/styles/ ./src/styles/
COPY src/types/ ./src/types/
COPY src/main.tsx ./src/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Build Frontend
RUN npm run build

# Rust Backend Build Stage
FROM rust:1.82-alpine AS backend-builder

# Alpine Dependencies für Rust Build
RUN apk add --no-cache musl-dev openssl-dev

WORKDIR /app

# Cargo.toml und Cargo.lock kopieren
COPY Cargo.toml ./
COPY Cargo.lock* ./

# Source Code kopieren
COPY src/ ./src/

# Release Build
RUN cargo build --release

# Final Runtime Stage
FROM alpine:3.18

# Runtime Dependencies
RUN apk add --no-cache ca-certificates openssl

# Non-root User erstellen
RUN addgroup -g 1001 -S chatglm && \
    adduser -S chatglm -u 1001 -G chatglm

WORKDIR /app

# Backend Binary kopieren
COPY --from=backend-builder /app/target/release/chatglm-web ./chatglm-web

# Frontend Static Files kopieren
COPY --from=frontend-builder /app/dist/ ./static/

# Konfigurationsdateien kopieren
COPY config.toml ./config.toml

# Ownership auf chatglm User setzen
RUN chown -R chatglm:chatglm /app

# Auf Non-root User wechseln
USER chatglm

# Port exposieren
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start Command
CMD ["./chatglm-web"]
