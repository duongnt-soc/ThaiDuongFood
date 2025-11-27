# ml-language/app/services/search_service.py
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
from typing import List, Dict, Any
import re

from app.core.preprocessing import preprocess_vietnamese_text

MODEL_PATH = "app/data/tfidf_vectorizer.pkl"
MATRIX_PATH = "app/data/tfidf_matrix.pkl"
PRODUCT_DATA_PATH = "app/data/product_data.pkl"

class SearchService:
    def __init__(self):
        # Từ điển Việt-Anh cho món ăn
        self.vi_en_dict = {
            # Thịt/Protein
            'gà': 'chicken',
            'thịt gà': 'chicken',
            'cá': 'fish salmon',
            'cá hồi': 'salmon',
            'bò': 'beef steak',
            'thịt bò': 'beef steak',
            'heo': 'pork ribs',
            'lợn': 'pork',
            'sườn': 'ribs',
            'vịt': 'duck',
            'hải sản': 'seafood shrimp scallop paella',
            'tôm': 'shrimp',
            'sò': 'scallop mussel',
            'nghêu': 'mussel',
            'mực': 'calamari',

            # Món ăn
            'pizza': 'pizza',
            'bánh mì': 'bread toast',
            'mì ý': 'pasta spaghetti lasagna carbonara',
            'pasta': 'pasta spaghetti',
            'salad': 'salad',
            'xà lách': 'salad',
            'súp': 'soup',
            'canh': 'soup',
            'burger': 'burger',
            'bánh ngọt': 'cake dessert',
            'bánh': 'cake bread pie pancake',
            'bánh pancake': 'pancake',
            'khoai tây chiên': 'fries french fries',
            'trứng': 'omelette egg',
            'rau': 'vegetable',
            'quả': 'fruit',

            # Đồ uống
            'cà phê': 'coffee espresso cappuccino latte',
            'cafe': 'coffee',
            'nước': 'juice water drink beverage',
            'nước cam': 'orange juice',
            'nước chanh': 'lemonade',
            'rượu': 'wine beer',
            'rượu vang': 'wine',
            'rượu vang đỏ': 'red wine',
            'rượu vang trắng': 'white wine',
            'bia': 'beer craft beer',
            'cocktail': 'mojito cocktail',
            'coca': 'coca cola',

            # Món tráng miệng
            'tráng miệng': 'dessert cake tiramisu cheesecake',
            'ngọt': 'sweet dessert cake chocolate',
            'kem': 'ice cream',
            'sô cô la': 'chocolate lava cake',
            'socola': 'chocolate',
            'tiramisu': 'tiramisu',
            'pho mát': 'cheese cheesecake',
            'phô mai': 'cheese',

            # Phương thức nấu
            'nướng': 'grilled roasted bbq',
            'rán': 'fried crispy',
            'chiên': 'fried crispy',
            'hấp': 'steamed',
            'luộc': 'boiled',

            # Tính từ
            'ngon': 'delicious fresh tasty gourmet',
            'tươi': 'fresh',
            'giòn': 'crispy',
            'mềm': 'tender soft',
            'béo': 'creamy rich',
            'cay': 'spicy pepper',
        }

        self.vectorizer = None
        self.tfidf_matrix = None
        self.product_data = pd.DataFrame()
        self._load_model()

    def _load_model(self):
        """Load model và dữ liệu đã train"""
        try:
            self.vectorizer = joblib.load(MODEL_PATH)
            self.tfidf_matrix = joblib.load(MATRIX_PATH)
            self.product_data = joblib.load(PRODUCT_DATA_PATH)
            print("TF-IDF model and data loaded successfully.")
        except FileNotFoundError:
            print("TF-IDF model files not found. Need to train first.")
        except Exception as e:
            print(f"Error loading TF-IDF model: {e}")

    def translate_vietnamese_to_english(self, text: str) -> str:
        """Dịch từ tiếng Việt sang tiếng Anh"""
        text_lower = text.lower()

        # Tìm và thay thế các cụm từ dài trước (nhiều từ)
        for vi_phrase, en_phrase in sorted(self.vi_en_dict.items(), key=lambda x: len(x[0]), reverse=True):
            if vi_phrase in text_lower:
                text_lower = text_lower.replace(vi_phrase, f" {en_phrase} ")

        return text_lower

    def enhance_query(self, query: str) -> str:
        """Tăng cường query bằng cách thêm từ tiếng Anh"""
        # Xử lý query gốc
        processed = preprocess_vietnamese_text(query)

        # Thêm bản dịch tiếng Anh
        translated = self.translate_vietnamese_to_english(query)

        # Kết hợp cả hai
        enhanced = f"{processed} {translated}"

        # Loại bỏ khoảng trắng thừa
        enhanced = re.sub(r'\s+', ' ', enhanced).strip()

        return enhanced

    def train(self, products: List[Dict[str, Any]]):
        """Huấn luyện mô hình TF-IDF từ danh sách sản phẩm"""
        if not products:
            print("No products data to train.")
            return

        df = pd.DataFrame(products)

        # Kết hợp các trường text cần thiết
        df['searchable_text'] = df['name'].fillna('') + " " + \
                                df['description'].fillna('') + " " + \
                                df['details'].fillna('')

        print(f"Preprocessing {len(df)} products...")
        df['processed_text'] = df['searchable_text'].apply(preprocess_vietnamese_text)
        print("Preprocessing done.")

        # Chỉ giữ lại các cột cần thiết để lưu trữ
        self.product_data = df[['id', 'processed_text']].copy()

        # Huấn luyện TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),  # Sử dụng unigrams và bigrams
            min_df=1
        )

        print("Fitting TF-IDF vectorizer...")
        self.tfidf_matrix = self.vectorizer.fit_transform(self.product_data['processed_text'])
        print("TF-IDF matrix shape:", self.tfidf_matrix.shape)

        # Lưu model và dữ liệu
        try:
            joblib.dump(self.vectorizer, MODEL_PATH)
            joblib.dump(self.tfidf_matrix, MATRIX_PATH)
            joblib.dump(self.product_data, PRODUCT_DATA_PATH)
            print("TF-IDF model and data saved.")
        except Exception as e:
            print(f"Error saving TF-IDF model: {e}")

    def search(self, query: str, top_n: int = 10) -> List[int]:
        """Tìm kiếm sản phẩm dựa trên query"""
        if self.vectorizer is None or self.tfidf_matrix is None or self.product_data.empty:
            print("Model not trained or loaded. Cannot search.")
            return []

        # Tăng cường query với bản dịch tiếng Anh
        enhanced_query = self.enhance_query(query)

        print(f"Original query: {query}")
        print(f"Enhanced query: {enhanced_query}")

        if not enhanced_query:
            return []

        # Chuyển query thành vector TF-IDF
        query_vector = self.vectorizer.transform([enhanced_query])

        # Tính cosine similarity
        cosine_similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Lấy top N chỉ số có similarity cao nhất
        related_indices = cosine_similarities.argsort()[-top_n:][::-1]

        # Lọc các kết quả có similarity > 0
        results = []
        for i in related_indices:
            if cosine_similarities[i] > 0.01:  # Ngưỡng tối thiểu
                product_id = self.product_data.iloc[i]['id']
                print(f"Match: ID {product_id}, Score: {cosine_similarities[i]:.4f}")
                results.append(product_id)

        return results

    def find_similar(self, product_id: int, top_n: int = 5) -> List[int]:
        """Tìm các sản phẩm tương tự nhất với product_id đã cho."""
        if self.vectorizer is None or self.tfidf_matrix is None or self.product_data.empty:
            print("Model not trained or loaded. Cannot find similar products.")
            return []

        # 1. Tìm index của sản phẩm gốc trong DataFrame/matrix
        try:
            # product_data là DataFrame pandas ['id', 'processed_text']
            target_index = self.product_data[self.product_data['id'] == product_id].index[0]
        except IndexError:
            raise ValueError(f"Product with ID {product_id} not found in the trained data.")

        # 2. Lấy vector TF-IDF của sản phẩm gốc
        target_vector = self.tfidf_matrix[target_index]

        # 3. Tính cosine similarity giữa vector gốc và TẤT CẢ các vector khác
        # cosine_similarity cần 2 input dạng ma trận (dù chỉ là 1 vector)
        similarities = cosine_similarity(target_vector, self.tfidf_matrix).flatten()

        # 4. Sắp xếp và lấy top N chỉ số (loại bỏ chính sản phẩm gốc)
        # argsort trả về chỉ số sau khi sắp xếp tăng dần
        # Lấy từ cuối lên (trừ sản phẩm gốc có similarity = 1.0)
        related_indices = np.argsort(similarities)[-(top_n + 1):-1][::-1] # Lấy top_n+1, bỏ cái cuối cùng (là chính nó), đảo ngược

        # 5. Lấy ID sản phẩm từ các chỉ số
        similar_product_ids = []
        for i in related_indices:
             # Đảm bảo index hợp lệ và score > ngưỡng nhỏ
             if i < len(self.product_data) and similarities[i] > 0.01:
                pid = self.product_data.iloc[i]['id']
                print(f"Similar product found: ID {pid}, Score: {similarities[i]:.4f}") # Debug
                similar_product_ids.append(pid)

        return similar_product_ids

# Khởi tạo instance (singleton-like)
search_service = SearchService()
