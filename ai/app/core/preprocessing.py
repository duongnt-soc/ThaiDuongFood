# ml-language/app/core/preprocessing.py
import re
import string
from underthesea import word_tokenize # Thư viện tách từ tiếng Việt

# Tải danh sách stop words từ file
try:
    with open("app/data/vietnamese_stopwords.txt", "r", encoding="utf-8") as f:
        STOPWORDS = set(word.strip() for word in f.readlines())
except FileNotFoundError:
    print("Warning: vietnamese_stopwords.txt not found. Using empty stopword list.")
    STOPWORDS = set()

def preprocess_vietnamese_text(text: str) -> str:
    """Chuẩn hóa và làm sạch văn bản tiếng Việt."""
    if not text:
        return ""
    # Chuyển thành chữ thường
    text = text.lower()
    # Loại bỏ URL (nếu có)
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Loại bỏ thẻ HTML (nếu có)
    text = re.sub(r'<.*?>', '', text)
    # Loại bỏ dấu câu và số
    text = text.translate(str.maketrans('', '', string.punctuation + string.digits))
    # Loại bỏ khoảng trắng thừa
    text = re.sub(r'\s+', ' ', text).strip()

    # Tách từ tiếng Việt
    tokens = word_tokenize(text, format="text") # Output dạng: "tôi là sinh_viên"

    # Loại bỏ stop words (cần tách lại theo khoảng trắng sau word_tokenize)
    cleaned_tokens = [word for word in tokens.split() if word not in STOPWORDS and len(word) > 1] # Chỉ giữ từ có > 1 ký tự

    return " ".join(cleaned_tokens)

# Ví dụ sử dụng:
# test_string = "   Món Phở Bò tái lăn này RẤT NGON!!! Giá chỉ 50.000đ. Xem thêm tại http://example.com"
# print(preprocess_vietnamese_text(test_string))
# Output có thể là: 'phở_bò tái_lăn ngon giá xem' (tùy thuộc vào stop words)
