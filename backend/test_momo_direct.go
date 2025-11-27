package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
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

func main() {
	partnerCode := "MOMOBKUN20180529"
	accessKey := "klm05TvNBzhg7h7j"
	secretKey := "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa"
	endpoint := "https://test-payment.momo.vn/v2/gateway/api/create"

	requestID := fmt.Sprintf("%d", time.Now().Unix())
	orderID := fmt.Sprintf("TEST_%s", requestID)
	amount := int64(10000)
	orderInfo := "Test payment"
	redirectURL := "http://localhost:3000/result"
	ipnURL := "http://localhost:3000/ipn"
	extraData := ""

	// Tạo signature theo thứ tự alphabet
	rawSignature := fmt.Sprintf("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
		accessKey, amount, extraData, ipnURL, orderID, orderInfo, partnerCode, redirectURL, requestID, "captureWallet",
	)

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(rawSignature))
	signature := hex.EncodeToString(h.Sum(nil))

	fmt.Println("=== MoMo Test Request ===")
	fmt.Printf("Raw Signature: %s\n", rawSignature)
	fmt.Printf("Signature: %s\n\n", signature)

	requestBody := MoMoRequest{
		PartnerCode: partnerCode,
		RequestID:   requestID,
		Amount:      amount,
		OrderID:     orderID,
		OrderInfo:   orderInfo,
		RedirectURL: redirectURL,
		IpnURL:      ipnURL,
		RequestType: "captureWallet",
		Lang:        "vi",
		Signature:   signature,
		ExtraData:   extraData,
	}

	jsonBody, _ := json.MarshalIndent(requestBody, "", "  ")
	fmt.Printf("Request Body:\n%s\n\n", string(jsonBody))

	resp, err := http.Post(endpoint, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	fmt.Printf("=== MoMo Response ===\n")
	fmt.Printf("Status Code: %d\n", resp.StatusCode)

	var prettyJSON bytes.Buffer
	json.Indent(&prettyJSON, body, "", "  ")
	fmt.Printf("Response Body:\n%s\n", prettyJSON.String())
}
