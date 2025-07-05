require('dotenv').config({ path: '.env.local' });

async function testDebugApi() {
    console.log('🧪 測試除錯 API...\n');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        // 1. 先獲取除錯資訊
        console.log('1️⃣ 獲取除錯資訊...');
        const infoResponse = await fetch(baseUrl + '/api/debug-line-send');
        
        if (infoResponse.ok) {
            const info = await infoResponse.json();
            console.log('📋 除錯資訊:', JSON.stringify(info, null, 2));
        } else {
            console.error('❌ 無法獲取除錯資訊');
        }
        
        console.log('\n2️⃣ 測試直接發送訊息給鈞...');
        
        // 2. 測試發送訊息
        const testData = {
            lineUserId: 'U55508e69afeffef5f001175fff31c9a4', // 鈞的 LINE User ID
            memberName: '鈞',
            testData: {
                date: '2025-07-05',
                requesterName: '測試用戶',
                requesterTeam: 'A',
                reason: '除錯測試：直接 API 測試'
            }
        };
        
        console.log('📤 發送測試請求...');
        const sendResponse = await fetch(baseUrl + '/api/debug-line-send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📥 回應狀態:', sendResponse.status);
        
        if (sendResponse.ok) {
            const result = await sendResponse.json();
            console.log('📋 發送結果:', JSON.stringify(result, null, 2));
            
            if (result.success) {
                console.log('\n✅ 成功！鈞應該收到測試訊息');
            } else {
                console.log('\n❌ 失敗！檢查錯誤詳情');
            }
        } else {
            const errorText = await sendResponse.text();
            console.error('❌ API 請求失敗:', errorText);
        }
        
        // 等待一下讓日誌輸出
        console.log('\n⏳ 等待 3 秒讓伺服器日誌輸出...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

async function main() {
    await testDebugApi();
    
    console.log('\n🎯 這個測試的目的:');
    console.log('1. 確認 Vercel 環境中的 LINE Bot 配置');
    console.log('2. 直接測試 sendOvertimeCancelledNotification 函數');
    console.log('3. 獲取詳細的錯誤訊息');
    console.log('4. 確認問題是在 LINE API 層面還是其他地方');
}

main().catch(console.error);
