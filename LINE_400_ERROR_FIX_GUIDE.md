# LINE 400 Bad Request 錯誤修復指南

## 🚨 問題描述
當訪問 LIFF 應用程式時出現 "400 Bad Request" 錯誤，通常是配置問題導致的。

## 🔍 診斷步驟

### 1. 使用診斷頁面
首先訪問診斷頁面檢查當前配置：
```
https://leave-ten.vercel.app/line-diagnosis
```

### 2. 檢查常見問題

#### A. LIFF Endpoint URL 設定錯誤
**最常見的原因** - LIFF 應用程式的 Endpoint URL 可能還指向舊的域名。

#### B. 環境變數未正確設定
Vercel 上的 `NEXT_PUBLIC_LIFF_ID` 可能未設定或設定錯誤。

#### C. LINE Channel 配置問題
LINE Login Channel 和 Messaging API Channel 的設定可能有誤。

## 🛠️ 修復步驟

### 步驟 1: 檢查並修復 LIFF 設定

1. **登入 LINE Developers Console**
   - 前往 https://developers.line.biz/console/
   - 使用您的 LINE 帳號登入

2. **選擇正確的 Provider 和 Channel**
   - 選擇您的 Provider
   - 選擇 **LINE Login Channel** (ID: 2007680034)

3. **檢查 LIFF 設定**
   - 點擊 "LIFF" 標籤
   - 找到您的 LIFF 應用程式 (ID: 2007680034-QnRpBayW)
   - 點擊編輯

4. **修正 Endpoint URL**
   ```
   正確設定：https://leave-ten.vercel.app/line-setup
   錯誤設定：http://localhost:3000/line-setup (或其他域名)
   ```

5. **檢查其他設定**
   ```
   App name: 請假系統身份設定 (或您偏好的名稱)
   Description: 員工身份設定和 LINE 通知綁定
   Scope: profile, openid
   Bot link feature: On (如果要連結 Messaging API)
   ```

### 步驟 2: 檢查 Vercel 環境變數

1. **登入 Vercel Dashboard**
   - 前往 https://vercel.com/dashboard
   - 選擇您的專案

2. **檢查環境變數**
   - 進入 Settings → Environment Variables
   - 確認以下變數存在且正確：

   ```
   NEXT_PUBLIC_LIFF_ID = 2007680034-QnRpBayW
   LINE_LOGIN_CHANNEL_ID = 2007680034
   LINE_LOGIN_CHANNEL_SECRET = 24620df01101ca2ecb0e063946f55715
   LINE_CHANNEL_ID = 2007680001
   LINE_CHANNEL_SECRET = 27eeaae0688caf6f1ad42fb885a9d446
   LINE_CHANNEL_ACCESS_TOKEN = P+wHgkg+GlbQBbRpACJu/WUTb1S7vkbHZ4vurlEzU417E2aP5WlADNSuFTbTeELz5IlLAzRPUNjSUuia0L2T9aXU0uULs9I6iT1np+i7dnEQ7sgKaRqELwouC7tnyPTRuiw8FkYNb5su2aEu39rfogdB04t89/1O/w1cDnyilFU=
   MONGODB_URI = mongodb+srv://fang7799009:QJ2F21C3ke3HQodN@leavecal.fvb6vng.mongodb.net/?retryWrites=true&w=majority&appName=LeaveCal
   ```

3. **重新部署**
   - 修改環境變數後，點擊 "Redeploy" 重新部署

### 步驟 3: 檢查 LINE Channel 基本設定

1. **LINE Login Channel 設定**
   - Channel ID: 2007680034
   - Channel Secret: 24620df01101ca2ecb0e063946f55715
   - Callback URL: `https://leave-ten.vercel.app/line-redirect`

2. **Messaging API Channel 設定**
   - Channel ID: 2007680001
   - Channel Secret: 27eeaae0688caf6f1ad42fb885a9d446
   - Webhook URL: `https://leave-ten.vercel.app/api/line-webhook`
   - Webhook 使用: 啟用

## 🧪 測試驗證

### 1. 基本測試
```
1. 訪問診斷頁面: https://leave-ten.vercel.app/line-diagnosis
2. 檢查所有項目是否顯示 ✅
3. 點擊 "測試 LIFF 初始化" 按鈕
4. 點擊 "開啟 LIFF 應用程式" 按鈕
```

### 2. 完整流程測試
```
1. 在 LINE 中開啟 LIFF URL: https://liff.line.me/2007680034-QnRpBayW
2. 應該能正常載入身份設定頁面
3. 能夠登入並選擇身份
4. 完成設定後能正常跳轉
```

## 🚨 如果問題持續存在

### 選項 1: 重新創建 LIFF 應用程式

1. **刪除現有 LIFF 應用程式**
   - 在 LINE Developers Console 中刪除現有的 LIFF 應用程式

2. **創建新的 LIFF 應用程式**
   ```
   LIFF app name: 請假系統身份設定
   Endpoint URL: https://leave-ten.vercel.app/line-setup
   Scope: profile, openid
   Bot link feature: On
   ```

3. **更新環境變數**
   - 將新的 LIFF ID 更新到 Vercel 環境變數中

### 選項 2: 檢查網路和防火牆

1. **確認網路連接**
   - 確保能正常訪問 LINE 服務
   - 檢查是否有防火牆阻擋

2. **清除瀏覽器快取**
   - 清除瀏覽器快取和 Cookie
   - 嘗試使用無痕模式

## 📞 聯絡支援

如果以上步驟都無法解決問題：

1. **收集診斷資訊**
   - 訪問 `/line-diagnosis` 頁面
   - 截圖診斷結果
   - 記錄錯誤訊息

2. **檢查 LINE 官方文檔**
   - LIFF 文檔: https://developers.line.biz/en/docs/liff/
   - 錯誤代碼參考: https://developers.line.biz/en/docs/liff/troubleshooting/

3. **常見錯誤代碼**
   ```
   400 Bad Request: 通常是 Endpoint URL 或 LIFF ID 配置錯誤
   403 Forbidden: 權限問題，檢查 Channel 設定
   404 Not Found: LIFF 應用程式不存在或已刪除
   ```

## ✅ 成功指標

修復成功後，您應該能夠：
- ✅ 在 LINE 中正常開啟 LIFF 應用程式
- ✅ 完成 LINE 登入流程
- ✅ 正常選擇和設定身份
- ✅ 接收 LINE 通知訊息

---

**注意**: 修改 LINE 設定後可能需要等待幾分鐘才會生效。如果立即測試失敗，請等待 5-10 分鐘後再試。
