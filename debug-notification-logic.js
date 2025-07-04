const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function debugNotificationLogic() {
    console.log('🐛 深度除錯通知發送邏輯...\n');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        // 1. 檢查 UserProfile 中的用戶
        console.log('1️⃣ 檢查 UserProfile 中的用戶...');
        const usersResponse = await fetch(baseUrl + '/api/line-admin/users');
        
        if (usersResponse.ok) {
            const usersResult = await usersResponse.json();
            console.log('   UserProfile 用戶數:', usersResult.users ? usersResult.users.length : 0);
            
            if (usersResult.users && usersResult.users.length > 0) {
                usersResult.users.forEach(user => {
                    console.log(`   - ${user.memberName} (${user.team}班, 通知: ${user.notificationEnabled})`);
                });
            }
        } else {
            console.error('   ❌ 無法獲取 UserProfile 用戶');
        }
        
        console.log('');
        
        // 2. 模擬通知發送邏輯
        console.log('2️⃣ 模擬通知發送邏輯...');
        
        // 檢查環境變數
        const hasAccessToken = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const hasChannelSecret = !!process.env.LINE_CHANNEL_SECRET;
        
        console.log('   LINE Bot 配置檢查:');
        console.log('   - ACCESS_TOKEN:', hasAccessToken ? '✅' : '❌');
        console.log('   - CHANNEL_SECRET:', hasChannelSecret ? '✅' : '❌');
        
        if (!hasAccessToken || !hasChannelSecret) {
            console.log('   ❌ LINE Bot 配置不完整，通知會被跳過');
            return;
        }
        
        console.log('');
        
        // 3. 測試實際的通知 API
        console.log('3️⃣ 測試通知 API...');
        
        const testData = {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '除錯測試：檢查通知邏輯',
            excludeNames: []
        };
        
        console.log('   發送參數:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(baseUrl + '/api/overtime-opportunity', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('   HTTP 狀態:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('   回應內容:', JSON.stringify(result, null, 2));
            
            // 分析結果
            if (result.notified === 0) {
                console.log('\n🔍 分析：為什麼沒有人收到通知？');
                console.log('   可能原因：');
                console.log('   1. sendOvertimeCancelledNotificationExcluding 函數中的用戶查詢有問題');
                console.log('   2. UserProfile 和 LineUserState 的資料不匹配');
                console.log('   3. LINE API 發送失敗');
                console.log('   4. 用戶被意外排除');
            }
        } else {
            const errorText = await response.text();
            console.error('   ❌ API 請求失敗:', errorText);
        }
        
        console.log('');
        
        // 4. 檢查 LineUserState（間接）
        console.log('4️⃣ 檢查可能的問題...');
        console.log('   根據代碼邏輯，通知發送需要滿足以下條件：');
        console.log('   ✅ LINE Bot 配置正確');
        console.log('   ✅ 用戶在 UserProfile 中且 notificationEnabled = true');
        console.log('   ❓ 用戶在 LineUserState 中且 step = "name_selected"');
        console.log('   ❓ 用戶名稱不在 excludeNames 中');
        console.log('   ❓ LINE API 發送成功');
        
        console.log('\n💡 建議檢查：');
        console.log('   1. 鈞是否在 LineUserState 中有記錄且 step = "name_selected"');
        console.log('   2. sendOvertimeCancelledNotificationExcluding 函數的用戶合併邏輯');
        console.log('   3. LINE API 的實際發送狀況');
        
    } catch (error) {
        console.error('❌ 除錯過程發生錯誤:', error);
    }
}

async function testDirectLineMessage() {
    console.log('\n📱 測試直接發送 LINE 訊息...');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        // 使用測試 LINE 訊息 API
        const testMessageData = {
            message: '🧪 測試訊息：檢查鈞是否能收到 LINE 通知',
            targetUser: '鈞'
        };
        
        console.log('發送測試訊息給鈞...');
        const response = await fetch(baseUrl + '/api/test-line-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testMessageData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 測試訊息發送結果:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ 測試訊息發送失敗:', errorText);
        }
        
    } catch (error) {
        console.error('❌ 測試直接訊息失敗:', error);
    }
}

async function main() {
    await debugNotificationLogic();
    await testDirectLineMessage();
    
    console.log('\n🎯 結論：');
    console.log('如果鈞能收到測試訊息但收不到加班取消通知，');
    console.log('問題可能在於 sendOvertimeCancelledNotificationExcluding 函數的邏輯。');
}

main();
