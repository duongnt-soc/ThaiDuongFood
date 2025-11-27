# ml-language/app/main.py
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import pandas as pd
import requests # Để gọi API Go lấy dữ liệu train

from app.services.search_service import search_service
from app.services.recommend_service import recommend_service
from app.models.schemas import SearchQuery, ProductData, RecommendationRequest, TrainNBRequest

app = FastAPI(title="ThaiDuong's Food ML Service")

# === Cấu hình CORS ===
origins = [
    "http://localhost:3000", # Địa chỉ frontend Next.js
    # Thêm các origin khác nếu cần (ví dụ: địa chỉ deploy)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Cho phép tất cả các phương thức (GET, POST, ...)
    allow_headers=["*"], # Cho phép tất cả các header
)
# === Kết thúc cấu hình CORS ===

# === Endpoints Huấn luyện ===

@app.post("/train-search", summary="Huấn luyện hoặc cập nhật mô hình tìm kiếm TF-IDF")
async def train_search_model(products: List[ProductData]):
    """
    Nhận danh sách sản phẩm từ backend Go và huấn luyện lại TF-IDF.
    Backend Go sẽ gọi endpoint này khi có cập nhật sản phẩm.
    """
    try:
        product_dicts = [p.dict() for p in products]
        search_service.train(product_dicts)
        return {"message": "TF-IDF model training initiated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train TF-IDF model: {str(e)}")

@app.post("/train-recommendation", summary="Huấn luyện mô hình gợi ý Naive Bayes")
async def train_recommendation_model(data: TrainNBRequest):
    """
    Nhận dữ liệu huấn luyện (ví dụ: text mô tả sp đã mua và category_id) từ backend Go.
    Backend Go cần chuẩn bị dữ liệu này từ DB orders và products.
    """
    try:
        # Chuyển đổi dữ liệu thành DataFrame nếu cần
        # Ví dụ: df = pd.DataFrame(data.training_samples)
        # recommend_service.train(df)
        # Giả sử data.training_samples là list of dicts {'text_features': '...', 'category_id': 1}
        df = pd.DataFrame(data.training_samples)
        if not df.empty:
             recommend_service.train(df)
             return {"message": "Naive Bayes model training initiated successfully."}
        else:
             return {"message": "No training data provided."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train Naive Bayes model: {str(e)}")

# === Endpoint Tìm kiếm ===

@app.post("/search", response_model=List[int], summary="Tìm kiếm sản phẩm bằng TF-IDF")
async def perform_search(query: SearchQuery):
    """
    Nhận query từ backend Go, trả về danh sách ID sản phẩm được sắp xếp.
    """
    try:
        results = search_service.search(query.text, top_n=query.limit)
        return results
    except Exception as e:
        # Log the error e
        raise HTTPException(status_code=500, detail="Search failed.")

# === Endpoint Gợi ý ===

@app.post("/recommend", response_model=List[int], summary="Gợi ý category sản phẩm bằng Naive Bayes")
async def get_recommendations(request: RecommendationRequest):
    """
    Nhận text mô tả lịch sử mua hàng của user từ backend Go,
    trả về danh sách category ID được gợi ý.
    """
    try:
        # Backend Go cần tổng hợp text từ các sản phẩm user đã mua
        top_categories = recommend_service.predict_top_categories(
            request.user_purchase_history,
            top_n=request.limit
        )
        return top_categories
    except Exception as e:
        # Log the error e
        raise HTTPException(status_code=500, detail="Recommendation failed.")

# === Endpoint Sản phẩm tương tự
@app.get("/related-products/{product_id}",
         response_model=List[int],
         summary="Tìm sản phẩm liên quan bằng TF-IDF Cosine Similarity")
async def get_related_products(product_id: int, limit: int = 5):
    """
    Nhận ID sản phẩm, tìm vector TF-IDF của nó,
    tính cosine similarity với tất cả các sản phẩm khác,
    trả về ID của các sản phẩm tương tự nhất.
    """
    try:
        # Gọi hàm mới trong search_service để tìm sản phẩm liên quan
        related_ids = search_service.find_similar(product_id, top_n=limit)
        return related_ids
    except ValueError as ve: # Bắt lỗi nếu không tìm thấy product_id
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        # Log the error e
        raise HTTPException(status_code=500, detail="Failed to find related products.")

# === Endpoint Health Check ===
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# --- Chạy server (ví dụ) ---
if __name__ == "__main__":
    import uvicorn
    # Chạy lệnh: uvicorn app.main:app --reload --port 8001
    uvicorn.run(app, host="0.0.0.0", port=8001)
