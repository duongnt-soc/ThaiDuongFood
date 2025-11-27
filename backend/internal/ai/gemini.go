package ai

import (
	"context"
	"fmt"
	// "log"
	"os"
	"strings"
	"backend/internal/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func GetGenerativeResponse(req models.ChatbotRequest, productsInCart []models.Product, allProducts []models.Product) (string, error) {
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil { return "", err }
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")

	prompt := "Bạn là một trợ lý dinh dưỡng của cửa hàng bán đồ ăn Thái Dương. Hãy trả lời súc tích bằng tiếng Việt (dưới 80 từ). Khi gợi ý món ăn, BẮT BUỘC phải chọn một món có tên trong danh sách 'THỰC ĐƠN HIỆN CÓ' được cung cấp.\n\n"

	if req.UserProfile != nil {
		var userContext []string
		if req.UserProfile.WeightKG != nil && req.UserProfile.HeightCM != nil {
			h := float64(*req.UserProfile.HeightCM) / 100
			w := float64(*req.UserProfile.WeightKG)
			if h > 0 {
				bmi := w / (h * h)
				userContext = append(userContext, fmt.Sprintf("cao %dcm, nặng %dkg (BMI %.1f)", *req.UserProfile.HeightCM, *req.UserProfile.WeightKG, bmi))
			}
		}
		if req.UserProfile.HealthConditions != nil && *req.UserProfile.HealthConditions != "" {
			userContext = append(userContext, fmt.Sprintf("có bệnh lý: %s", *req.UserProfile.HealthConditions))
		}
		if req.UserProfile.DietaryPreference != nil && *req.UserProfile.DietaryPreference != "" {
			userContext = append(userContext, fmt.Sprintf("có sở thích ăn uống: %s", *req.UserProfile.DietaryPreference))
		}
		if len(userContext) > 0 {
			prompt += fmt.Sprintf("BỐI CẢNH NGƯỜI DÙNG:\nNgười dùng %s.\n\n", strings.Join(userContext, ", "))
		}
	}

	if len(productsInCart) > 0 {
		var totalCalories int
		var cartDetails strings.Builder
		for _, p := range productsInCart {
			totalCalories += p.Calories
			cartDetails.WriteString(fmt.Sprintf("- %s (%d kcal)\n", p.Name, p.Calories))
		}
		prompt += fmt.Sprintf("BỐI CẢNH GIỎ HÀNG: Giỏ hàng của người dùng có tổng cộng %d kcal và chứa các món sau:\n%s\n", totalCalories, cartDetails.String())
	} else {
		prompt += "BỐI CẢNH GIỎ HÀNG: Giỏ hàng của người dùng đang trống.\n\n"
	}

	var menuDetails strings.Builder
	for _, p := range allProducts {
		menuDetails.WriteString(fmt.Sprintf("- %s (Giá: $%.2f, %d kcal, Mô tả: %s)\n", p.Name, p.Price, p.Calories, p.Description))
	}
	prompt += fmt.Sprintf("THỰC ĐƠN HIỆN CÓ:\n%s\n", menuDetails.String())

	lastUserMessage := ""
	if len(req.History) > 0 {
		lastUserMessage = req.History[len(req.History)-1].Content
	}
	prompt += fmt.Sprintf("CÂU HỎI CỦA NGƯỜI DÙNG:\n\"%s\"\n\n", lastUserMessage)

	prompt += "Dựa vào tất cả thông tin trên, hãy đưa ra một câu trả lời hữu ích:"

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("error generating content: %w", err)
	}

    if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil && len(resp.Candidates[0].Content.Parts) > 0 {
        if part, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
            return string(part), nil
        }
    }

	return "Xin lỗi, tôi không thể nghĩ ra câu trả lời ngay lúc này.", nil
}
