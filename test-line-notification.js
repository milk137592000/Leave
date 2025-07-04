const { Client } = require('@line/bot-sdk');
require('dotenv').config({ path: '.env.local' });

// LINE Bot 配置
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// 鈞的 LINE User ID (從API獲取)
const junLineUserId = 'U55508e69afeffef5f001175fff31c9a4';

async function testSendMessage() {
    try {
        console.log('🧪 測試發送LINE訊息給鈞...');
        console.log(`📱 LINE User ID: ${junLineUserId}`);
        
        const message = {
            type: 'text',
            text: '🔔 測試通知\n\n這是一個測試訊息，確認LINE通知功能是否正常運作。\n\n如果您收到這個訊息，表示通知系統運作正常！'
        };

        await client.pushMessage(junLineUserId, message);
        console.log('✅ 訊息發送成功！');
        
    } catch (error) {
        console.error('❌ 發送失敗:', error);
        
        if (error.response) {
            console.error('HTTP狀態:', error.response.status);
            console.error('錯誤詳情:', error.response.data);
        }
    }
}

async function testOvertimeNotification() {
    try {
        console.log('\n🔔 測試加班通知...');
        
        const notification = {
            requesterName: '科',
            requesterTeam: 'D',
            date: '2025-07-04',
            period: '全天',
            suggestedTeam: 'C',
            reason: '測試：D班科請假，需要C班支援'
        };

        const messageText = `🔔 加班通知

📅 日期：${notification.date}
👤 請假人員：${notification.requesterTeam}班 ${notification.requesterName}
⏰ 時段：${notification.period}

💼 建議加班班級：${notification.suggestedTeam}班
📝 原因：${notification.reason}

如果您可以協助加班，請聯繫相關負責人。
感謝您的配合！`;

        const message = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(junLineUserId, message);
        console.log('✅ 加班通知發送成功！');
        
    } catch (error) {
        console.error('❌ 加班通知發送失敗:', error);
        
        if (error.response) {
            console.error('HTTP狀態:', error.response.status);
            console.error('錯誤詳情:', error.response.data);
        }
    }
}

async function main() {
    console.log('🚀 開始測試LINE通知功能...\n');
    
    // 檢查環境變數
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
        console.error('❌ 缺少 LINE_CHANNEL_ACCESS_TOKEN 環境變數');
        return;
    }
    
    if (!process.env.LINE_CHANNEL_SECRET) {
        console.error('❌ 缺少 LINE_CHANNEL_SECRET 環境變數');
        return;
    }
    
    console.log('✅ LINE環境變數已設定');
    
    // 測試基本訊息發送
    await testSendMessage();
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 測試加班通知
    await testOvertimeNotification();
    
    console.log('\n🎯 測試完成！請檢查鈞的LINE是否收到訊息。');
}

main().catch(console.error);
