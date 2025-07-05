const { Client } = require('@line/bot-sdk');
require('dotenv').config({ path: '.env.local' });

// LINE Bot 配置
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// 鈞的 LINE User ID
const junLineUserId = 'U55508e69afeffef5f001175fff31c9a4';

async function testDirectLineSend() {
    console.log('🧪 測試直接發送 LINE 訊息給鈞...\n');
    
    try {
        // 檢查環境變數
        if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            console.error('❌ 缺少 LINE_CHANNEL_ACCESS_TOKEN');
            return;
        }
        
        if (!process.env.LINE_CHANNEL_SECRET) {
            console.error('❌ 缺少 LINE_CHANNEL_SECRET');
            return;
        }
        
        console.log('✅ LINE Bot 環境變數已設定');
        console.log(`📱 目標 LINE User ID: ${junLineUserId}`);
        
        // 1. 測試基本訊息
        console.log('\n1️⃣ 測試基本訊息...');
        const basicMessage = {
            type: 'text',
            text: '🔔 測試訊息\n\n這是一個基本的測試訊息，確認 LINE Bot 是否能正常發送訊息給鈞。'
        };
        
        await client.pushMessage(junLineUserId, basicMessage);
        console.log('✅ 基本訊息發送成功');
        
        // 等待 2 秒
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. 測試加班取消通知格式
        console.log('\n2️⃣ 測試加班取消通知格式...');
        const cancelNotification = {
            type: 'text',
            text: `📢 請假取消通知

📅 日期：2025-07-05
👤 人員：A班 測試用戶
📝 說明：除錯測試：檢查通知邏輯

原本的加班需求也一併取消。`
        };
        
        await client.pushMessage(junLineUserId, cancelNotification);
        console.log('✅ 加班取消通知發送成功');
        
        // 等待 2 秒
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. 測試模擬 sendOvertimeCancelledNotification 函數
        console.log('\n3️⃣ 測試模擬 sendOvertimeCancelledNotification 函數...');
        
        const cancelledOpportunity = {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '除錯測試：檢查通知邏輯'
        };
        
        // 模擬函數邏輯
        const isLeaveCancel = cancelledOpportunity.reason.includes('請假') ||
                             cancelledOpportunity.reason.includes('刪除') ||
                             cancelledOpportunity.reason.includes('取消');
        
        const title = isLeaveCancel ? '📢 請假取消通知' : '❌ 加班機會已取消';
        const content = isLeaveCancel ?
            `${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName} 的請假已取消` :
            `${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName} 的加班機會已取消`;
        
        const simulatedMessage = {
            type: 'text',
            text: `${title}\n\n📅 日期：${cancelledOpportunity.date}\n👤 人員：${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName}\n📝 說明：${cancelledOpportunity.reason}\n\n${isLeaveCancel ? '原本的加班需求也一併取消。' : '感謝您的關注！'}`
        };
        
        console.log('發送的訊息內容:');
        console.log(simulatedMessage.text);
        console.log('');
        
        await client.pushMessage(junLineUserId, simulatedMessage);
        console.log('✅ 模擬函數訊息發送成功');
        
        console.log('\n🎯 測試結果:');
        console.log('✅ LINE Bot 配置正確');
        console.log('✅ 能夠成功發送訊息給鈞');
        console.log('✅ 加班取消通知格式正確');
        console.log('');
        console.log('💡 如果鈞收到了這些測試訊息，但沒有收到實際的加班取消通知，');
        console.log('   問題可能在於 sendOvertimeCancelledNotificationExcluding 函數的');
        console.log('   錯誤處理或日誌記錄不完整。');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        
        if (error.response) {
            console.error('HTTP 狀態:', error.response.status);
            console.error('錯誤詳情:', error.response.data);
        }
        
        // 分析常見錯誤
        if (error.message.includes('Invalid reply token')) {
            console.log('\n💡 這是 reply token 錯誤，但我們使用的是 pushMessage，所以不應該出現這個錯誤');
        } else if (error.message.includes('Invalid user ID')) {
            console.log('\n💡 LINE User ID 可能無效或用戶已封鎖 Bot');
        } else if (error.message.includes('Invalid access token')) {
            console.log('\n💡 LINE Channel Access Token 可能無效或過期');
        }
    }
}

async function testLineUserIdValidity() {
    console.log('\n🔍 測試 LINE User ID 有效性...');
    
    try {
        // 嘗試獲取用戶資料（如果 Bot 有權限的話）
        const profile = await client.getProfile(junLineUserId);
        console.log('✅ LINE User ID 有效');
        console.log(`用戶顯示名稱: ${profile.displayName}`);
    } catch (error) {
        console.log('❌ 無法獲取用戶資料（這是正常的，因為需要用戶先與 Bot 互動）');
        console.log('但這不影響 pushMessage 的功能');
    }
}

async function main() {
    await testDirectLineSend();
    await testLineUserIdValidity();
    
    console.log('\n📋 下一步建議:');
    console.log('1. 檢查鈞的 LINE 是否收到測試訊息');
    console.log('2. 如果收到了，問題在於 sendOvertimeCancelledNotificationExcluding 的錯誤處理');
    console.log('3. 如果沒收到，檢查 LINE Bot 設定或用戶是否封鎖了 Bot');
}

main().catch(console.error);
