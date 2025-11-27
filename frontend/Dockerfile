#
# STAGE 1: Build (Giai đoạn "Build")
#
# Sử dụng image Node.js 18 (Alpine) làm base
FROM node:18-alpine AS builder

# Set thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json
# (Chúng ta copy riêng 2 file này để tận dụng cache của Docker)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code còn lại
COPY . .

# Chạy lệnh build (Next.js sẽ tự động build với output 'standalone')
RUN npm run build

#
# STAGE 2: Runner (Giai đoạn "Chạy")
#
# Sử dụng một image Node.js 18 (Alpine) MỚI SẠCH SẼ
FROM node:18-alpine

WORKDIR /app

# Chỉ copy những file cần thiết từ stage "builder"
# Đây là sức mạnh của 'standalone' output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# (Quan trọng) Mở cổng 3000 (cổng mặc định của Next.js)
EXPOSE 3000

# Set môi trường là production
ENV NODE_ENV=production

# Lệnh để khởi động server (Next.js server.js)
CMD ["node", "server.js"]

# docker build -t thai-duong-food-app .
# docker run -d \
#   -p 3124:3000 \
#   --network food-network \
#   --name food-app \
#   -e NEXT_PUBLIC_API_HOST="http://food-api:8080/api" \
#   thai-duong-food-app
