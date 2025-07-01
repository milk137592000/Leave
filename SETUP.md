# 本地開發環境設定指引

## 📋 **必要步驟**

### 1. **設定 MongoDB 資料庫**

您有兩個選擇：

#### 選擇 A: MongoDB Atlas (推薦 - 免費雲端資料庫)
1. 前往 [MongoDB Atlas](https://cloud.mongodb.com)
2. 註冊免費帳號
3. 建立新的叢集 (選擇免費的 M0 方案)
4. 建立資料庫使用者
5. 設定網路存取 (允許所有 IP: 0.0.0.0/0)
6. 取得連接字串

#### 選擇 B: 本地 MongoDB
1. 安裝 MongoDB Community Edition
2. 啟動 MongoDB 服務
3. 使用本地連接字串: `mongodb://localhost:27017/calendar-app`

### 2. **更新環境變數**

編輯 `.env.local` 文件，將 `MONGODB_URI` 替換為您的實際連接字串：

```bash
# MongoDB Atlas 範例
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/calendar-app?retryWrites=true&w=majority

# 或本地 MongoDB
MONGODB_URI=mongodb://localhost:27017/calendar-app
```

### 3. **啟動專案**

```bash
npm run dev
```

專案將在 http://localhost:3000 啟動

## 🔧 **故障排除**

- 如果遇到 MongoDB 連接錯誤，請檢查連接字串是否正確
- 確保 MongoDB Atlas 的網路存取設定允許您的 IP
- 檢查資料庫使用者名稱和密碼是否正確
