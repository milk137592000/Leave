# Vercel 部署檢查清單

## 部署前檢查

### ✅ 程式碼準備
- [x] 所有程式碼已提交到 Git
- [x] 建置測試通過 (`npm run build`)
- [x] 環境變數已正確設定
- [x] LINE 憑證已更新

### ✅ 環境變數設定
- [x] MONGODB_URI
- [x] LINE_LOGIN_CHANNEL_ID
- [x] LINE_LOGIN_CHANNEL_SECRET  
- [x] LINE_CHANNEL_ID
- [x] LINE_CHANNEL_SECRET
- [x] LINE_CHANNEL_ACCESS_TOKEN
- [x] LIFF_ID
- [x] NEXT_PUBLIC_LIFF_ID

### ✅ 設定檔案
- [x] vercel.json 已設定
- [x] next.config.mjs 已更新
- [x] package.json 腳本正確
- [x] .env.example 已建立

## 部署步驟

### 方法一：使用部署腳本
```bash
./deploy.sh
```

### 方法二：手動部署
1. 登入 Vercel Dashboard
2. 匯入 GitHub repository
3. 設定環境變數
4. 點擊 Deploy

## 部署後檢查

### ✅ 基本功能測試
- [ ] 網站可正常訪問
- [ ] 首頁載入正常
- [ ] API 路由回應正常

### ✅ LINE 整合測試
- [ ] 更新 LINE Webhook URL
- [ ] 更新 LIFF Endpoint URL
- [ ] 測試 LINE 登入功能
- [ ] 測試訊息推送功能

### ✅ 資料庫連接測試
- [ ] MongoDB 連接正常
- [ ] 資料讀寫功能正常
- [ ] 用戶資料儲存正常

## 部署後設定

### 1. 更新 LINE Webhook URL
- 前往 LINE Developers Console
- 進入 Messaging API Channel
- 更新 Webhook URL：`https://your-vercel-domain.vercel.app/api/line-webhook`
- 啟用 Webhook

### 2. 更新 LIFF Endpoint URL
- 前往 LINE Developers Console
- 進入 LINE Login Channel
- 找到 LIFF 應用程式
- 更新 Endpoint URL：`https://your-vercel-domain.vercel.app`

### 3. 測試 API 端點
```bash
# 測試 webhook 健康檢查
curl https://your-vercel-domain.vercel.app/api/line-webhook

# 測試其他 API
curl https://your-vercel-domain.vercel.app/api/user-profile
```

## 常見問題排除

### 1. 環境變數未生效
- 檢查 Vercel Dashboard 中的環境變數設定
- 確保變數名稱正確
- 重新部署專案

### 2. LINE Webhook 錯誤
- 檢查 Webhook URL 是否正確
- 確認 LINE Channel Secret 正確
- 檢查 Vercel Functions 日誌

### 3. 資料庫連接失敗
- 檢查 MongoDB URI 格式
- 確認 MongoDB Atlas 網路設定
- 檢查資料庫用戶權限

### 4. LIFF 應用程式無法載入
- 檢查 LIFF ID 是否正確
- 確認 Endpoint URL 設定
- 檢查 HTTPS 憑證

## 監控和維護

### 日誌監控
- Vercel Dashboard > Functions > View Function Logs
- 監控 API 回應時間和錯誤率

### 效能監控
- Vercel Analytics
- 監控頁面載入時間
- 追蹤用戶互動

### 定期檢查
- 每週檢查 LINE Token 有效性
- 每月檢查資料庫連接狀態
- 定期更新相依套件

## 成功部署確認

當以下項目都完成時，表示部署成功：

- [x] 網站可正常訪問
- [x] LINE 登入功能正常
- [x] 加班通知功能正常
- [x] 資料庫讀寫正常
- [x] 所有 API 端點回應正常

## 聯絡資訊

如有部署問題，請聯繫：
- 技術支援：[您的聯絡方式]
- 文件參考：README.md, VERCEL_DEPLOYMENT_GUIDE.md
