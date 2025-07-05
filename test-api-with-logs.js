require('dotenv').config({ path: '.env.local' });

async function testApiWithLogs() {
    console.log('🧪 測試 API 並檢查詳細日誌...\n');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        const testData = {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '除錯測試：檢查通知邏輯',
            excludeNames: []
        };
        
        console.log('📤 發送請求到:', baseUrl + '/api/overtime-opportunity');
        console.log('📋 請求參數:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(baseUrl + '/api/overtime-opportunity', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('\n📥 回應狀態:', response.status);
        console.log('📥 回應標頭:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const result = await response.json();
            console.log('\n📋 回應內容:', JSON.stringify(result, null, 2));
            
            // 分析結果
            console.log('\n🔍 結果分析:');
            console.log(`✅ 請求成功: ${result.success}`);
            console.log(`📊 通知統計: 成功 ${result.notified || result.success || 0}, 失敗 ${result.failed || 0}, 排除 ${result.excluded || 0}`);
            
            if ((result.failed || 0) > 0) {
                console.log('\n❌ 有發送失敗的情況！');
                console.log('💡 這表示用戶被找到了，但 LINE API 發送失敗');
                console.log('💡 檢查伺服器日誌應該能看到詳細的錯誤訊息');
            }
            
            if ((result.notified || result.success || 0) === 0 && (result.failed || 0) === 0) {
                console.log('\n🤔 沒有找到任何用戶');
                console.log('💡 這表示用戶查詢邏輯有問題');
            }
            
        } else {
            const errorText = await response.text();
            console.error('\n❌ API 請求失敗:', errorText);
        }
        
        // 等待一下，讓日誌有時間輸出
        console.log('\n⏳ 等待 3 秒讓伺服器日誌輸出...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📋 下一步建議:');
        console.log('1. 檢查 Vercel 的 Function Logs 或本地伺服器日誌');
        console.log('2. 查看是否有詳細的錯誤訊息');
        console.log('3. 確認 sendOvertimeCancelledNotification 的具體失敗原因');
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

async function testDirectApiCall() {
    console.log('\n🔧 測試直接調用 sendOvertimeCancelledNotificationExcluding...\n');
    
    try {
        // 這裡我們需要模擬 Next.js 環境
        // 但由於這是一個 Node.js 腳本，我們無法直接導入 Next.js 模組
        console.log('💡 由於環境限制，無法直接測試函數');
        console.log('💡 建議在 Next.js API 路由中添加更多日誌');
        
    } catch (error) {
        console.error('❌ 直接測試失敗:', error);
    }
}

async function main() {
    await testApiWithLogs();
    await testDirectApiCall();
    
    console.log('\n🎯 總結:');
    console.log('根據之前的測試，我們知道:');
    console.log('✅ LINE Bot 配置正確');
    console.log('✅ 能夠直接發送訊息給鈞');
    console.log('✅ 鈞在 UserProfile 中且通知啟用');
    console.log('❌ 但通過 API 發送時失敗');
    console.log('');
    console.log('💡 問題很可能是:');
    console.log('1. LINE API 在伺服器環境中的權限問題');
    console.log('2. 訊息格式或內容問題');
    console.log('3. 網路連接問題');
    console.log('4. LINE Bot 的配置在不同環境中不一致');
}

main().catch(console.error);
