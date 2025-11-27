# ml-language/app/services/recommend_service.py
import joblib
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer # Hoặc TfidfVectorizer
from sklearn.pipeline import Pipeline
import pandas as pd
from typing import List, Dict, Any

from app.core.preprocessing import preprocess_vietnamese_text

NB_MODEL_PATH = "app/data/naive_bayes_model.pkl"
# Cần dữ liệu lịch sử mua hàng để train, ví dụ: user_id, product_id, category_id

class RecommendService:
    def __init__(self):
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        try:
            self.pipeline = joblib.load(NB_MODEL_PATH)
            print("Naive Bayes model loaded successfully.")
        except FileNotFoundError:
            print("Naive Bayes model file not found. Need to train first.")
        except Exception as e:
            print(f"Error loading Naive Bayes model: {e}")

    def train(self, training_data: pd.DataFrame):
        """
        Huấn luyện mô hình Naive Bayes để dự đoán category.
        training_data cần có cột 'text_features' (ví dụ: mô tả các sp đã mua)
        và cột 'category_id' (label).
        """
        if training_data.empty or 'text_features' not in training_data or 'category_id' not in training_data:
             print("Invalid training data format.")
             return

        print(f"Preprocessing {len(training_data)} training samples...")
        training_data['processed_text'] = training_data['text_features'].apply(preprocess_vietnamese_text)
        print("Preprocessing done.")

        # Xây dựng pipeline: Vectorizer -> Classifier
        self.pipeline = Pipeline([
            ('vectorizer', CountVectorizer(max_features=2000)), # Hoặc TfidfVectorizer
            ('classifier', MultinomialNB())
        ])

        print("Training Naive Bayes model...")
        self.pipeline.fit(training_data['processed_text'], training_data['category_id'])
        print("Training complete.")

        # Lưu model
        try:
            joblib.dump(self.pipeline, NB_MODEL_PATH)
            print("Naive Bayes model saved.")
        except Exception as e:
            print(f"Error saving Naive Bayes model: {e}")

    def predict_top_categories(self, user_purchase_history_text: str, top_n: int = 3) -> List[int]:
        """Dự đoán category người dùng có thể thích dựa trên lịch sử mua hàng."""
        if self.pipeline is None:
            print("Model not trained or loaded. Cannot predict.")
            return []

        processed_text = preprocess_vietnamese_text(user_purchase_history_text)
        if not processed_text:
            return []

        # Dự đoán xác suất cho tất cả các class (category)
        probabilities = self.pipeline.predict_proba([processed_text])[0]
        classes = self.pipeline.classes_ # Lấy danh sách các category_id mà model biết

        # Kết hợp class và xác suất, sắp xếp
        class_probabilities = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)

        # Lấy top N category IDs
        top_categories = [int(cat_id) for cat_id, prob in class_probabilities[:top_n] if prob > 0.05] # Ngưỡng xác suất

        return top_categories

# Khởi tạo instance
recommend_service = RecommendService()
