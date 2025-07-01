# LINE 連動設定指引

## 📋 **設定步驟**

### 第一步：建立 LINE Developers 帳號

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用您的 LINE 帳號登入
3. 建立新的 Provider（提供者）

### 第二步：建立 Messaging API Channel

1. 在 Provider 中點擊「Create a new channel」
2. 選擇「Messaging API」
3. 填寫以下資訊：
   - **Channel name**: 丁二烯請假系統
   - **Channel description**: 四輕丁二烯請假和加班通知系統
   - **Category**: 選擇適當的類別
   - **Subcategory**: 選擇適當的子類別
4. 同意條款並建立 Channel

### 第三步：設定 Channel

1. 進入剛建立的 Channel
2. 在「Basic settings」頁面記錄：
   - **Channel ID**
   - **Channel secret**
3. 在「Messaging API」頁面：
   - 點擊「Issue」產生 **Channel access token**
   - 記錄這個 token

### 第四步：建立 LIFF App

1. 在同一個 Channel 中，找到「LIFF」分頁
2. 點擊「Add」建立新的 LIFF App
3. 填寫以下資訊：
   - **LIFF app name**: 身份設定
   - **Size**: Compact
   - **Endpoint URL**: `https://your-domain.com/line-setup`
   - **Scope**: 勾選 `profile`
4. 建立後記錄 **LIFF ID**

### 第五步：更新環境變數

編輯 `.env.local` 文件，填入從 LINE Developers Console 取得的資訊：

```bash
# LINE 設定
LIFF_ID=1234567890-abcdefgh
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here
```

### 第六步：設定 Webhook（可選）

如果需要接收用戶訊息：

1. 在「Messaging API」頁面設定 Webhook URL：
   ```
   https://your-domain.com/api/line/webhook
   ```
2. 啟用「Use webhook」

## 🚀 **使用方式**

### 用戶設定身份

1. 用戶在 LINE 中加入您的 Bot 為好友
2. 發送 LIFF App 連結給用戶：
   ```
   https://liff.line.me/1234567890-abcdefgh
   ```
3. 用戶點擊連結後會開啟身份設定頁面
4. 用戶選擇自己的班級、角色和姓名
5. 設定完成後會收到測試訊息

### 自動通知流程

1. 當有人在系統中請假時
2. 系統自動計算建議的加班班級
3. 發送 LINE 訊息給該班級的所有已註冊用戶
4. 訊息包含請假人員、時段和建議原因

## 🔧 **測試功能**

### 測試用戶註冊

```bash
curl -X GET "http://localhost:3000/api/overtime-notification?team=A"
```

### 測試發送通知

```bash
curl -X POST "http://localhost:3000/api/overtime-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterName": "測試員工",
    "requesterTeam": "A",
    "date": "2025-07-01",
    "period": "全天",
    "suggestedTeam": "B",
    "reason": "A班人員請假，需要B班協助加班"
  }'
```

## 📱 **用戶體驗流程**

1. **首次使用**：
   - 用戶點擊 LIFF 連結
   - 登入 LINE 帳號
   - 選擇身份（班級、角色、姓名）
   - 收到設定成功的測試訊息

2. **日常使用**：
   - 當有加班需求時自動收到通知
   - 訊息包含完整的請假和加班資訊
   - 可以聯繫相關負責人確認加班

## ⚠️ **注意事項**

1. **隱私保護**：
   - 只有已註冊的用戶會收到通知
   - 用戶可以隨時關閉通知
   - 不會洩露其他用戶的個人資訊

2. **安全性**：
   - Channel Secret 和 Access Token 必須保密
   - 定期檢查和更新 Token
   - 監控異常的 API 使用

3. **維護**：
   - 定期檢查 LINE Bot 的運作狀態
   - 監控訊息發送的成功率
   - 處理用戶的身份變更需求

## 🆘 **故障排除**

### 常見問題

1. **LIFF 無法開啟**：
   - 檢查 LIFF ID 是否正確
   - 確認 Endpoint URL 可以正常訪問

2. **無法發送訊息**：
   - 檢查 Channel Access Token 是否正確
   - 確認用戶已加 Bot 為好友

3. **用戶無法設定身份**：
   - 檢查數據庫連接
   - 確認團隊配置正確

### 日誌檢查

查看應用日誌以診斷問題：
```bash
# 檢查 LINE 相關日誌
grep "LINE" logs/app.log

# 檢查通知發送日誌
grep "加班通知" logs/app.log
```
