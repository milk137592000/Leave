# 加班通知系統 - Calendar App

一個基於 Next.js 的日曆應用程式，具備請假管理和 LINE 整合的加班通知功能。

## 功能特色

- 📅 日曆檢視與請假記錄
- 👥 團隊成員管理
- 📱 LINE 整合加班通知
- 🔔 自動加班機會通知
- 📊 請假追蹤與管理
- 🚀 Vercel 一鍵部署

## 技術架構

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: MongoDB with Mongoose
- **整合**: LINE Messaging API, LINE LIFF
- **部署**: Vercel

## 快速開始

### 前置需求

- Node.js 18+
- MongoDB Atlas 帳號
- LINE Developer 帳號

### 安裝步驟

1. 複製專案：
```bash
git clone <repository-url>
cd calendar-app
```

2. 安裝相依套件：
```bash
npm install
```

3. 設定環境變數：
```bash
cp .env.example .env.local
```

編輯 `.env.local` 填入實際值。

4. 啟動開發伺服器：
```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 環境變數設定

必要的環境變數已在 `.env.local` 中設定完成。

## LINE 整合設定

1. 建立 LINE Provider 和 Messaging API Channel
2. 建立 LIFF 應用程式
3. 設定 webhook URL: `https://your-domain.vercel.app/api/line-webhook`
4. 配置環境變數

詳細設定說明請參考 [LINE_SETUP_GUIDE.md](./LINE_SETUP_GUIDE.md)。

## 部署到 Vercel

### 方法一：自動部署腳本

```bash
./deploy.sh
```

### 方法二：手動部署

詳細部署說明請參考 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)。

## API 路由

- `/api/leave` - 請假管理
- `/api/line-webhook` - LINE webhook 處理器
- `/api/overtime-notification` - 加班通知系統
- `/api/overtime-opportunity` - 加班機會管理
- `/api/user-profile` - 用戶資料管理

## 可用指令

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建置正式版本
- `npm run start` - 啟動正式伺服器
- `npm run lint` - 執行 ESLint
- `npm run test-db` - 測試 MongoDB 連接
- `npm run test-line` - 測試 LINE 連接

## 部署後設定

1. **更新 LINE Webhook URL**
   - 前往 LINE Developers Console
   - 更新 Webhook URL 為：`https://your-vercel-domain.vercel.app/api/line-webhook`

2. **更新 LIFF Endpoint URL**
   - 前往 LINE Developers Console
   - 更新 LIFF Endpoint URL 為：`https://your-vercel-domain.vercel.app`

3. **測試功能**
   - 測試 LINE 登入功能
   - 測試加班通知功能
   - 驗證 webhook 運作

## 授權條款

此專案採用 MIT 授權條款。

---
*最後更新：2025-07-02 19:30 - 測試自動部署*
