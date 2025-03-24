FROM node:20.11.1-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
RUN npm run build
# Create a directory for file uploads
RUN mkdir -p uploads && chmod 777 uploads
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production
RUN npm ci --only=production
COPY --from=development /usr/src/app/dist ./dist
# Create and configure uploads directory in production
RUN mkdir -p uploads && chmod 777 uploads
# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/index.js"]

# Default stage
FROM development

