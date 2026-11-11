# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev
RUN npm install tsx prisma

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma ./node_modules/@prisma

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000

# Run migrations, seed if db is empty, and start
CMD ["sh", "-c", "npx prisma db push && (npx tsx prisma/seed.ts || true) && node dist/index.js"]
