require('dotenv').config({ path: '.env.local' });

async function testDirectApiCall() {
    console.log('🧪 測試直接 LINE API 調用...\n');
    
    try {
        const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
        const lineUserId = 'U55508e69afeffef5f001175fff31c9a4'; // 鈞的 LINE User ID
        
        if (!accessToken) {
            console.error('❌ LINE_CHANNEL_ACCESS_TOKEN 未設定');
            return;
        }
        
        console.log('✅ ACCESS_TOKEN 已設定');
        console.log(`📱 目標用戶: ${lineUserId}`);
        console.log(`🔑 Token 長度: ${accessToken.length}`);
        console.log(`🔑 Token 前10字符: ${accessToken.substring(0, 10)}`);
        
        const message = '🧪 直接 API 測試\n\n這是通過直接調用 LINE API 發送的測試訊息，繞過 LINE Bot SDK。\n\n如果您收到這個訊息，表示直接 API 調用方法有效！';
        
        console.log('\n📤 發送請求到 LINE API...');
        
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: lineUserId,
                messages: [{
                    type: 'text',
                    text: message
                }]
            })
        });
        
        console.log(`📥 回應狀態: ${response.status}`);
        console.log(`📥 回應狀態文字: ${response.statusText}`);
        
        if (response.ok) {
            console.log('✅ 直接 LINE API 調用成功！');
            console.log('💡 這表示問題確實在於 LINE Bot SDK 的 Authorization header 處理');
        } else {
            const errorText = await response.text();
            console.error('❌ 直接 LINE API 調用失敗:');
            console.error('錯誤內容:', errorText);
            
            // 分析錯誤
            if (response.status === 401) {
                console.log('\n💡 401 錯誤通常表示:');
                console.log('1. Access Token 無效或過期');
                console.log('2. Authorization header 格式錯誤');
            } else if (response.status === 400) {
                console.log('\n💡 400 錯誤通常表示:');
                console.log('1. 請求格式錯誤');
                console.log('2. LINE User ID 無效');
                console.log('3. 訊息格式錯誤');
            }
        }
        
        // 測試加班取消通知格式
        console.log('\n2️⃣ 測試加班取消通知格式...');
        
        const cancelMessage = `📢 請假取消通知

📅 日期：2025-07-05
👤 人員：A班 測試用戶
📝 說明：直接 API 測試：檢查通知邏輯

原本的加班需求也一併取消。`;

        const cancelResponse = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: lineUserId,
                messages: [{
                    type: 'text',
                    text: cancelMessage
                }]
            })
        });
        
        if (cancelResponse.ok) {
            console.log('✅ 加班取消通知格式測試成功！');
        } else {
            console.error('❌ 加班取消通知格式測試失敗');
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

async function main() {
    await testDirectApiCall();
    
    console.log('\n🎯 測試結論:');
    console.log('如果直接 API 調用成功，但 LINE Bot SDK 失敗，');
    console.log('那麼問題確實在於 SDK 對 Authorization header 的處理。');
    console.log('');
    console.log('💡 解決方案:');
    console.log('1. 使用直接 API 調用作為主要方法');
    console.log('2. 或者更新 Vercel 環境變數並重新部署');
    console.log('3. 檢查 LINE Bot SDK 版本是否有已知問題');
}

main().catch(console.error);
