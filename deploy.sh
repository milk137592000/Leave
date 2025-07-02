#!/bin/bash

# Vercel 部署腳本
echo "🚀 開始部署到 Vercel..."

# 檢查是否安裝了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安裝，正在安裝..."
    npm install -g vercel
fi

# 檢查是否已登入
echo "🔐 檢查 Vercel 登入狀態..."
if ! vercel whoami &> /dev/null; then
    echo "請先登入 Vercel:"
    vercel login
fi

# 建置專案
echo "🔨 建置專案..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 建置成功"
else
    echo "❌ 建置失敗，請檢查錯誤訊息"
    exit 1
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "📝 請記得更新 LINE Webhook URL 和 LIFF Endpoint URL"
else
    echo "❌ 部署失敗，請檢查錯誤訊息"
    exit 1
fi

echo "🎉 部署完成！"
