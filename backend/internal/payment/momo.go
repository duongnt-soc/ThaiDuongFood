package payment

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"
)

type MoMoRequest struct {
	PartnerCode string `json:"partnerCode"`
	RequestID   string `json:"requestId"`
	Amount      int64  `json:"amount"`
	OrderID     string `json:"orderId"`
	OrderInfo   string `json:"orderInfo"`
	RedirectURL string `json:"redirectUrl"`
	IpnURL      string `json:"ipnUrl"`
	RequestType string `json:"requestType"`
	ExtraData   string `json:"extraData"`
	Lang        string `json:"lang"`
	Signature   string `json:"signature"`
}

type MoMoResponse struct {
	PartnerCode  string `json:"partnerCode"`
	RequestID    string `json:"requestId"`
	OrderID      string `json:"orderId"`
	Amount       int64  `json:"amount"`
	ResponseTime int64  `json:"responseTime"`
	Message      string `json:"message"`
	ResultCode   int    `json:"resultCode"`
	PayURL       string `json:"payUrl"`
}

func CreateMoMoPayment(orderID int, amount int64) (string, error) {
	partnerCode := os.Getenv("MOMO_PARTNER_CODE")
	accessKey := os.Getenv("MOMO_ACCESS_KEY")
	secretKey := os.Getenv("MOMO_SECRET_KEY")
	endpoint := os.Getenv("MOMO_ENDPOINT")

	frontendURL := os.Getenv("PUBLIC_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	requestID := strconv.FormatInt(time.Now().Unix(), 10)
	orderIDStr := fmt.Sprintf("BISTROBLISS_%d_%s", orderID, requestID)
	orderInfo := "Payment for your order"
	redirectURL := frontendURL + "/order-result"
	ipnURL := frontendURL + "/api/webhook/momo"
	extraData := ""

	rawSignature := fmt.Sprintf("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
		accessKey, amount, extraData, ipnURL, orderIDStr, orderInfo, partnerCode, redirectURL, requestID, "captureWallet",
	)

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(rawSignature))
	signature := hex.EncodeToString(h.Sum(nil))

	requestBody := MoMoRequest{
		PartnerCode: partnerCode,
		RequestID:   requestID,
		Amount:      amount,
		OrderID:     orderIDStr,
		OrderInfo:   orderInfo,
		RedirectURL: redirectURL,
		IpnURL:      ipnURL,
		RequestType: "captureWallet",
		Lang:        "vi",
		Signature:   signature,
		ExtraData:   extraData,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	resp, err := http.Post(endpoint, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var momoResp MoMoResponse
	if err := json.Unmarshal(body, &momoResp); err != nil {
		return "", err
	}

	if momoResp.ResultCode != 0 {
		return "", fmt.Errorf("MoMo payment creation failed: %s", momoResp.Message)
	}

	return momoResp.PayURL, nil
}
