# Giai đoạn 1: Base Image (Python 3.11)
FROM python:3.11-slim

# Đặt biến môi trường
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Cài đặt các gói hệ thống cần thiết (build-essential, curl)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt Rust (bắt buộc cho 'underthesea')
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
# Thêm Rust vào PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Tạo user (non-root) để tăng cường bảo mật
RUN useradd -m -u 1000 appuser
WORKDIR /app

# Cài đặt Maturin (bắt buộc cho 'underthesea')
RUN pip install maturin

# Copy file requirements và cài đặt (tận dụng cache)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy toàn bộ thư mục 'app' (chứa code và các file .pkl, .txt)
COPY ./app ./app

# Gán quyền sở hữu cho user mới
RUN chown -R appuser:appuser /app

# Chuyển sang user non-root
USER appuser

# Mở cổng 8001 (cổng FastAPI)
EXPOSE 8001

# Lệnh để chạy Uvicorn
# (Không dùng --reload trong production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
