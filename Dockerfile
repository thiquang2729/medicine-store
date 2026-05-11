# ==========================================
# Giai đoạn 1: Install Dependencies
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Sao chép các file quản lý package
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# Giai đoạn 2: Build Application
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# (Tuỳ chọn) Nếu bạn dùng Prisma, cần generate Prisma Client ở đây
# COPY prisma ./prisma
# RUN npx prisma generate

# Xây dựng ứng dụng Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==========================================
# Giai đoạn 3: Production Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Thêm người dùng không có đặc quyền root để bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép file public và cấu hình standalone của Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Chạy server
CMD ["node", "server.js"]
