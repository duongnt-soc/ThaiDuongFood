# Giai đoạn 1: Build (Giữ nguyên, rất tốt)
FROM golang:1.25.1-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
RUN apk add --no-cache ca-certificates
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/api

# Giai đoạn 2: Chạy (Phiên bản "tối giản" hơn)
FROM scratch
# 'scratch' là image trống, nhỏ nhất có thể (0MB)

WORKDIR /

# Copy file binary từ builder
COPY --from=builder /server /server

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose port 8080
EXPOSE 8080

# Lệnh để chạy server
# Lưu ý: 'scratch' không có shell, nên phải dùng ["/server"]
CMD ["/server"]
