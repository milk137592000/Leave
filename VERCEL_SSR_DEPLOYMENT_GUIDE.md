# Vercel SSR 部署指南

## SSR 修復完成

✅ 所有 SSR (Server-Side Rendering) 問題已修復，應用程式現在可以安全地部署到 Vercel。

## 修復內容摘要

### 1. 核心修復
- ✅ 添加了對 `window`、`localStorage`、`navigator` 等瀏覽器 API 的安全檢查
- ✅ 創建了 SSR 安全的工具函數和 React Hooks
- ✅ 修復了所有直接存取瀏覽器 API 的程式碼
- ✅ 添加了 Suspense 邊界以處理 `useSearchParams`
- ✅ 優化了 Next.js 配置以支援更好的 SSR

### 2. 新增的安全工具
- `src/utils/ssr-safe.ts` - SSR 安全工具函數
- `src/hooks/useBrowserSafe.ts` - SSR 安全 React Hooks
- `src/app/ssr-test/page.tsx` - SSR 測試頁面

## 部署到 Vercel

### 方法一：自動部署（推薦）

1. **確保 GitHub 倉庫是公開的或已正確連接到 Vercel**
   ```bash
   # 檢查倉庫狀態
   git status
   git add .
   git commit -m "修復 SSR 問題：添加 window 和 localStorage 的安全檢查"
   git push origin main
   ```

2. **Vercel 會自動檢測到變更並開始部署**
   - 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
   - 查看部署狀態

### 方法二：手動觸發部署

1. **在 Vercel Dashboard 中**
   - 進入您的專案
   - 點擊 "Deployments" 標籤
   - 點擊 "Redeploy" 按鈕

2. **使用 Vercel CLI**
   ```bash
   # 安裝 Vercel CLI（如果尚未安裝）
   npm i -g vercel

   # 登入 Vercel
   vercel login

   # 部署
   vercel --prod
   ```

## 環境變數設定

確保在 Vercel Dashboard 中設定以下環境變數：

### 必要環境變數
```
MONGODB_URI=mongodb+srv://fang7799009:QJ2F21C3ke3HQodN@leavecal.fvb6vng.mongodb.net/?retryWrites=true&w=majority&appName=LeaveCal
LINE_LOGIN_CHANNEL_ID=2007680034
LINE_LOGIN_CHANNEL_SECRET=24620df01101ca2ecb0e063946f55715
LINE_CHANNEL_ID=2007680001
LINE_CHANNEL_SECRET=27eeaae0688caf6f1ad42fb885a9d446
LINE_CHANNEL_ACCESS_TOKEN=P+wHgkg+GlbQBbRpACJu/WUTb1S7vkbHZ4vurlEzU417E2aP5WlADNSuFTbTeELz5IlLAzRPUNjSUuia0L2T9aXU0uULs9I6iT1np+i7dnEQ7sgKaRqELwouC7tnyPTRuiw8FkYNb5su2aEu39rfogdB04t89/1O/w1cDnyilFU=
NEXT_PUBLIC_LIFF_ID=2007680034-QnRpBayW
```

### 設定步驟
1. 進入 Vercel Dashboard
2. 選擇您的專案
3. 進入 Settings → Environment Variables
4. 添加上述環境變數
5. 確保選擇正確的環境（Production, Preview, Development）

## 部署後驗證

### 1. 基本功能測試
訪問以下頁面確認功能正常：
- `https://your-domain.vercel.app/` - 主頁
- `https://your-domain.vercel.app/line-admin` - LINE 管理頁面
- `https://your-domain.vercel.app/line-setup` - LINE 身份設定
- `https://your-domain.vercel.app/ssr-test` - SSR 測試頁面

### 2. SSR 測試
訪問 `https://your-domain.vercel.app/ssr-test` 檢查：
- ✅ 所有 SSR 安全檢查都通過
- ✅ 沒有 hydration 錯誤
- ✅ 瀏覽器 API 存取正常
- ✅ 複製功能正常運作
- ✅ LocalStorage 功能正常

### 3. LINE 功能測試
- ✅ LIFF 應用程式正常載入
- ✅ LINE 登入功能正常
- ✅ 身份設定功能正常
- ✅ 通知功能正常

## 常見問題排除

### 1. 部署失敗
**問題**: 部署過程中出現錯誤
**解決方案**:
- 檢查 Vercel 部署日誌
- 確認所有環境變數已正確設定
- 檢查 `package.json` 中的依賴項

### 2. SSR 錯誤
**問題**: 仍然出現 SSR 相關錯誤
**解決方案**:
- 訪問 `/ssr-test` 頁面檢查具體問題
- 確認所有瀏覽器 API 存取都使用了安全包裝函數
- 檢查瀏覽器控制台是否有錯誤訊息

### 3. LINE 功能異常
**問題**: LINE 相關功能無法正常運作
**解決方案**:
- 檢查 LIFF ID 是否正確設定
- 確認 LINE Channel 設定正確
- 檢查 webhook URL 是否指向正確的域名

### 4. 環境變數問題
**問題**: 環境變數無法讀取
**解決方案**:
- 確認變數名稱正確（區分大小寫）
- 檢查是否選擇了正確的環境
- 重新部署以應用新的環境變數

## 監控和維護

### 1. 部署監控
- 定期檢查 Vercel Dashboard 中的部署狀態
- 設定部署失敗通知

### 2. 效能監控
- 使用 Vercel Analytics 監控頁面效能
- 檢查 Core Web Vitals 指標

### 3. 錯誤監控
- 檢查 Vercel Function 日誌
- 監控 API 路由的錯誤率

## 後續優化建議

### 1. 效能優化
- 考慮使用 Next.js Image 組件優化圖片載入
- 實施程式碼分割以減少初始載入時間

### 2. SEO 優化
- 添加適當的 meta 標籤
- 實施結構化資料

### 3. 安全性
- 定期更新依賴項
- 實施 Content Security Policy (CSP)

## 聯絡支援

如果遇到部署問題：
1. 檢查 Vercel 官方文檔
2. 查看 Next.js 官方文檔
3. 檢查本專案的 GitHub Issues

---

**注意**: 此次 SSR 修復確保了應用程式在 Vercel 上的穩定運行，所有瀏覽器 API 存取都已經過安全包裝，不會再出現 SSR 相關錯誤。
