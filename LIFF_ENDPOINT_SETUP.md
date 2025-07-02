# LIFF Endpoint URL 設定指南

## 📍 設定位置

LIFF Endpoint URL 需要在 **LINE Developers Console** 中設定，不是在程式碼中。

## 🔧 詳細設定步驟

### 1. 登入 LINE Developers Console
- 前往：https://developers.line.biz/console/
- 使用您的 LINE 帳號登入

### 2. 選擇正確的 Channel
- 選擇您的 Provider
- 進入 **LINE Login Channel**（不是 Messaging API Channel）
- Channel ID: **2007680034**

### 3. 進入 LIFF 設定
- 在左側選單中點擊 **"LIFF"**
- 找到您的 LIFF 應用程式
- LIFF ID: **2007680034-QnRpBayW**

### 4. 編輯 Endpoint URL
- 點擊 LIFF 應用程式旁的 **"Edit"** 按鈕
- 在 **"Endpoint URL"** 欄位中輸入您的 Vercel 網址

## 🎯 Endpoint URL 格式

### 部署前（開發環境）
```
http://localhost:3000
```

### 部署後（正式環境）
```
https://your-vercel-domain.vercel.app
```

## 📝 設定範例

假設您的 Vercel 網址是 `https://calendar-app-main.vercel.app`：

1. **LIFF Endpoint URL**: `https://calendar-app-main.vercel.app`
2. **Webhook URL**: `https://calendar-app-main.vercel.app/api/line-webhook`

## ⚠️ 重要注意事項

### 1. 使用正確的 Channel
- LIFF 設定在 **LINE Login Channel** 中
- Webhook 設定在 **Messaging API Channel** 中

### 2. URL 格式要求
- 必須使用 HTTPS（正式環境）
- 不要在 URL 後面加 `/`
- 確保網址可以正常訪問

### 3. 設定順序
1. 先部署到 Vercel 取得網址
2. 再到 LINE Console 更新 Endpoint URL
3. 最後測試 LIFF 功能

## 🧪 測試方法

### 1. 檢查 LIFF 連結
```
https://liff.line.me/2007680034-QnRpBayW
```

### 2. 測試步驟
1. 在 LINE 中開啟 LIFF 連結
2. 應該會開啟您的網站
3. 可以正常進行 LINE 登入
4. 能夠選擇名稱並儲存

## 🔍 常見問題

### 1. LIFF 無法開啟
- 檢查 Endpoint URL 是否正確
- 確認網站可以正常訪問
- 檢查 HTTPS 憑證

### 2. 登入失敗
- 檢查 LIFF ID 是否正確
- 確認環境變數設定
- 檢查 LINE Login Channel 設定

### 3. 找不到 LIFF 設定
- 確認您在 LINE Login Channel 中
- 不是在 Messaging API Channel 中
- Channel ID 應該是 2007680034

## 📱 完整流程

1. **部署到 Vercel** → 取得網址
2. **更新 LIFF Endpoint URL** → 在 LINE Console 中設定
3. **更新 Webhook URL** → 在 LINE Console 中設定
4. **測試功能** → 確認一切正常運作

## 📞 需要協助？

如果設定過程中遇到問題：
1. 檢查 Channel ID 是否正確
2. 確認您有該 Channel 的管理權限
3. 參考 LINE 官方文件：https://developers.line.biz/en/docs/liff/
