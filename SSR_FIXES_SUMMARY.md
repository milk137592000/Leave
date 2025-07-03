# SSR 問題修復總結

## 修復的問題

本次修復解決了應用程式中的 Server-Side Rendering (SSR) 問題，主要是添加了對 `window`、`localStorage`、`navigator` 等瀏覽器 API 的安全檢查。

## 修復的檔案

### 1. 核心工具函數

#### `src/lib/liff.ts`
- 添加了 `isClient()`, `safeWindow()`, `safeLocalStorage()`, `safeNavigator()` 等安全包裝函數
- 更新所有 LIFF 相關函數以使用安全的瀏覽器 API 存取
- 確保 LIFF SDK 只在客戶端載入和初始化

#### `src/utils/ssr-safe.ts` (新增)
- 提供完整的 SSR 安全工具函數集合
- 包含安全的瀏覽器 API 存取、剪貼簿操作、本地儲存等功能
- 提供客戶端專用程式碼執行的安全包裝器

#### `src/hooks/useBrowserSafe.ts` (新增)
- 提供 React Hook 形式的 SSR 安全功能
- `useBrowserSafe()`: 安全存取瀏覽器 API
- `useClipboard()`: 安全的剪貼簿操作
- `useLocalStorage()`: SSR 安全的本地儲存 Hook
- `useSafeNavigation()`: 安全的頁面導航功能

### 2. 頁面組件修復

#### `src/app/page.tsx`
- 更新剪貼簿操作使用新的 `useClipboard` Hook
- 移除直接存取 `navigator.clipboard` 的程式碼

#### `src/app/line-debug/page.tsx`
- 添加對 `window.location.href` 和 `navigator.userAgent` 的安全檢查
- 更新 LIFF 初始化程式碼以使用安全的 window 存取

#### `src/app/liff-test/page.tsx`
- 使用新的 `useClipboard` 和 `useSafeNavigation` Hooks
- 移除直接存取瀏覽器 API 的程式碼

#### `src/app/line-setup/page.tsx`
- 更新使用新的安全瀏覽器 API 存取方式
- 修復 localStorage 和 window.location 的存取

#### `src/app/line-redirect/page.tsx`
- 使用新的 `useLocalStorage` Hook 管理重定向目標
- 移除直接存取 localStorage 的程式碼

### 3. Hook 更新

#### `src/hooks/useLineAuth.ts`
- 導入並使用新的安全工具函數
- 更新登入函數以使用安全的瀏覽器 API 存取

### 4. 配置更新

#### `next.config.mjs`
- 添加 webpack 配置以優化 SSR 支援
- 添加編譯器選項以移除生產環境中的 console.log
- 確保客戶端專用程式碼不會在伺服器端執行

### 5. 測試頁面

#### `src/app/ssr-test/page.tsx` (新增)
- 提供完整的 SSR 安全性測試
- 驗證所有安全包裝函數和 Hooks 的功能
- 檢查 hydration 過程的正確性

## 修復的具體問題

### 1. 直接存取瀏覽器 API
**問題**: 直接使用 `window.location.href`、`navigator.userAgent`、`localStorage` 等
**修復**: 使用 `typeof window !== 'undefined'` 檢查或安全包裝函數

### 2. 剪貼簿操作
**問題**: 直接使用 `navigator.clipboard.writeText()`
**修復**: 使用 `useClipboard` Hook 或 `copyToClipboard` 工具函數，包含備用方案

### 3. 本地儲存存取
**問題**: 直接使用 `localStorage.getItem()` 和 `localStorage.setItem()`
**修復**: 使用 `useLocalStorage` Hook 或安全包裝函數

### 4. 頁面導航
**問題**: 直接使用 `window.location.href = url`
**修復**: 使用 `useSafeNavigation` Hook 或 `navigateTo` 工具函數

### 5. LIFF SDK 初始化
**問題**: 在伺服器端嘗試載入或初始化 LIFF SDK
**修復**: 添加客戶端檢查，確保只在瀏覽器環境中執行

## 使用方式

### 工具函數
```typescript
import { isClient, safeWindow, copyToClipboard } from '@/utils/ssr-safe';

// 檢查是否在客戶端
if (isClient()) {
    // 安全執行客戶端程式碼
}

// 安全存取 window
const win = safeWindow();
if (win) {
    console.log(win.location.href);
}

// 安全複製到剪貼簿
await copyToClipboard('Hello World');
```

### React Hooks
```typescript
import { useBrowserSafe, useClipboard, useLocalStorage } from '@/hooks/useBrowserSafe';

function MyComponent() {
    const { isClient, window, localStorage } = useBrowserSafe();
    const { copyToClipboard } = useClipboard();
    const [value, setValue] = useLocalStorage('key', 'default');
    
    // 使用安全的瀏覽器 API 存取
}
```

## 測試

訪問 `/ssr-test` 頁面可以測試所有 SSR 安全功能是否正常運作。

## 好處

1. **消除 SSR 錯誤**: 防止在伺服器端渲染時存取瀏覽器 API 導致的錯誤
2. **改善 SEO**: 確保頁面可以正確進行伺服器端渲染
3. **更好的用戶體驗**: 避免 hydration 不匹配導致的閃爍或錯誤
4. **程式碼一致性**: 提供統一的瀏覽器 API 存取方式
5. **更容易維護**: 集中管理所有 SSR 相關的安全檢查

## 注意事項

- 所有新的組件都應該使用提供的安全包裝函數或 Hooks
- 避免直接存取 `window`、`document`、`localStorage` 等瀏覽器 API
- 在 `useEffect` 中執行需要瀏覽器環境的程式碼
- 使用 `isClient()` 檢查來條件性執行客戶端專用程式碼
