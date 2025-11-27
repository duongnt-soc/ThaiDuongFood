# ml-language/app/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProductData(BaseModel):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    details: Optional[str] = None
    # Thêm các trường khác nếu cần cho việc train

class SearchQuery(BaseModel):
    text: str = Field(..., min_length=1, description="Nội dung tìm kiếm")
    limit: int = Field(10, gt=0, description="Số lượng kết quả tối đa")

class RecommendationRequest(BaseModel):
    user_id: int # Hoặc thông tin khác để định danh user
    user_purchase_history: str = Field(..., description="Tổng hợp text mô tả các sản phẩm user đã mua")
    limit: int = Field(5, gt=0, description="Số lượng category gợi ý tối đa")

class TrainingSampleNB(BaseModel):
    text_features: str # Ví dụ: "phở bò cơm rang gà rán"
    category_id: int   # Ví dụ: 1 (ID của category "Món chính")

class TrainNBRequest(BaseModel):
    training_samples: List[TrainingSampleNB] = Field(..., description="Dữ liệu để huấn luyện Naive Bayes")
