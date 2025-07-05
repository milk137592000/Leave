require('dotenv').config({ path: '.env.local' });

async function testExistingApi() {
    console.log('🧪 測試現有的 test-direct-message API...\n');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        // 測試直接訊息 API
        const testData = {
            lineUserId: 'U55508e69afeffef5f001175fff31c9a4', // 鈞的 LINE User ID
            message: '🧪 API 測試訊息\n\n這是通過 test-direct-message API 發送的測試訊息，用來確認 LINE Bot 在 Vercel 環境中是否正常工作。\n\n如果您收到這個訊息，表示 LINE Bot 基本功能正常！'
        };
        
        console.log('📤 發送測試請求到:', baseUrl + '/api/test-direct-message');
        console.log('📋 請求參數:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(baseUrl + '/api/test-direct-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('\n📥 回應狀態:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('📋 回應內容:', JSON.stringify(result, null, 2));
            
            if (result.success) {
                console.log('\n✅ 成功！test-direct-message API 工作正常');
                console.log('💡 這表示 LINE Bot 在 Vercel 環境中可以正常發送訊息');
                console.log('💡 問題可能在於 sendOvertimeCancelledNotification 函數的具體實作');
            } else {
                console.log('\n❌ 失敗！檢查錯誤詳情');
            }
        } else {
            const errorText = await response.text();
            console.error('❌ API 請求失敗:', errorText);
        }
        
        // 等待一下
        console.log('\n⏳ 等待 2 秒...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 現在測試加班取消通知的具體格式
        console.log('\n2️⃣ 測試加班取消通知的具體格式...');
        
        const cancelNotificationData = {
            lineUserId: 'U55508e69afeffef5f001175fff31c9a4',
            message: `📢 請假取消通知

📅 日期：2025-07-05
👤 人員：A班 測試用戶
📝 說明：除錯測試：檢查通知邏輯

原本的加班需求也一併取消。`
        };
        
        console.log('📤 發送加班取消通知格式測試...');
        
        const cancelResponse = await fetch(baseUrl + '/api/test-direct-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cancelNotificationData)
        });
        
        if (cancelResponse.ok) {
            const cancelResult = await cancelResponse.json();
            console.log('📋 加班取消通知測試結果:', JSON.stringify(cancelResult, null, 2));
            
            if (cancelResult.success) {
                console.log('\n✅ 加班取消通知格式測試成功！');
                console.log('💡 這表示訊息格式沒有問題');
            }
        } else {
            console.error('❌ 加班取消通知格式測試失敗');
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

async function main() {
    await testExistingApi();
    
    console.log('\n🎯 測試結論:');
    console.log('如果 test-direct-message API 能成功發送訊息，');
    console.log('但 sendOvertimeCancelledNotificationExcluding 失敗，');
    console.log('那麼問題很可能在於:');
    console.log('');
    console.log('1. sendOvertimeCancelledNotification 函數內部的錯誤處理');
    console.log('2. 訊息內容的特殊字符或格式問題');
    console.log('3. 函數調用時的參數問題');
    console.log('4. 異步處理的問題');
    console.log('');
    console.log('💡 建議下一步:');
    console.log('1. 檢查鈞是否收到測試訊息');
    console.log('2. 如果收到了，問題確定在 sendOvertimeCancelledNotification');
    console.log('3. 需要在該函數中添加更詳細的日誌');
}

main().catch(console.error);
