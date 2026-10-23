# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Install all dependencies (including devDependencies required for nest build)
COPY package*.json ./
RUN npm install

# Copy source code and build NestJS
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
