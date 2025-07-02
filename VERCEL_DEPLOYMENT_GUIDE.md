# Vercel 部署指南

## 前置準備

1. 確保您有 Vercel 帳號：https://vercel.com
2. 安裝 Vercel CLI（可選）：`npm i -g vercel`

## 部署步驟

### 方法一：透過 Vercel Dashboard（推薦）

1. **登入 Vercel Dashboard**
   - 前往 https://vercel.com/dashboard
   - 使用 GitHub、GitLab 或 Bitbucket 帳號登入

2. **匯入專案**
   - 點擊 "New Project"
   - 選擇 "Import Git Repository"
   - 選擇您的 GitHub repository

3. **設定環境變數**
   在 Vercel Dashboard 中設定以下環境變數：
   ```
   MONGODB_URI=mongodb+srv://fang7799009:QJ2F21C3ke3HQodN@leavecal.fvb6vng.mongodb.net/?retryWrites=true&w=majority&appName=LeaveCal
   NODE_ENV=production
   LINE_LOGIN_CHANNEL_ID=2007680034
   LINE_LOGIN_CHANNEL_SECRET=24620df01101ca2ecb0e063946f55715
   LINE_CHANNEL_ID=2007680001
   LINE_CHANNEL_SECRET=27eeaae0688caf6f1ad42fb885a9d446
   LINE_CHANNEL_ACCESS_TOKEN=P+wHgkg+GlbQBbRpACJu/WUTb1S7vkbHZ4vurlEzU417E2aP5WlADNSuFTbTeELz5IlLAzRPUNjSUuia0L2T9aXU0uULs9I6iT1np+i7dnEQ7sgKaRqELwouC7tnyPTRuiw8FkYNb5su2aEu39rfogdB04t89/1O/w1cDnyilFU=
   LIFF_ID=2007680034-QnRpBayW
   NEXT_PUBLIC_LIFF_ID=2007680034-QnRpBayW
   ```

4. **部署設定**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **點擊 Deploy**

### 方法二：透過 Vercel CLI

1. **安裝並登入**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **部署**
   ```bash
   vercel
   ```

3. **設定環境變數**
   ```bash
   vercel env add MONGODB_URI
   vercel env add LINE_LOGIN_CHANNEL_ID
   vercel env add LINE_LOGIN_CHANNEL_SECRET
   vercel env add LINE_CHANNEL_ID
   vercel env add LINE_CHANNEL_SECRET
   vercel env add LINE_CHANNEL_ACCESS_TOKEN
   vercel env add LIFF_ID
   vercel env add NEXT_PUBLIC_LIFF_ID
   ```

## 部署後設定

1. **更新 LINE Webhook URL**
   - 前往 LINE Developers Console
   - 更新 Webhook URL 為：`https://your-vercel-domain.vercel.app/api/line/webhook`

2. **更新 LIFF Endpoint URL**
   - 前往 LINE Developers Console
   - 更新 LIFF Endpoint URL 為：`https://your-vercel-domain.vercel.app`

3. **測試部署**
   - 訪問您的 Vercel 網址
   - 測試 LINE 登入功能
   - 測試加班通知功能

## 常見問題

### 1. 環境變數未生效
- 確保在 Vercel Dashboard 中正確設定所有環境變數
- 重新部署專案

### 2. LINE Webhook 錯誤
- 檢查 Webhook URL 是否正確
- 確保 LINE Channel Secret 正確

### 3. 資料庫連接失敗
- 檢查 MongoDB URI 是否正確
- 確保 MongoDB Atlas 允許 Vercel IP 存取

## 自動部署

設定完成後，每次推送到 main 分支都會自動觸發部署。

## 監控和日誌

- 在 Vercel Dashboard 中查看部署狀態
- 使用 Functions 頁面查看 API 日誌
- 使用 Analytics 監控網站效能
