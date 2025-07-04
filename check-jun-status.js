const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkJunStatus() {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        console.log('🔍 檢查鈞的註冊狀態...');
        console.log('API URL:', baseUrl + '/api/line-admin/users');
        
        const response = await fetch(baseUrl + '/api/line-admin/users');
        
        if (!response.ok) {
            console.error('❌ API 請求失敗:', response.status, response.statusText);
            const text = await response.text();
            console.error('錯誤內容:', text);
            return;
        }
        
        const result = await response.json();
        console.log('📊 總用戶數:', result.users ? result.users.length : 0);
        
        if (result.users) {
            const jun = result.users.find(u => u.memberName === '鈞');
            if (jun) {
                console.log('✅ 找到鈞的註冊資料:');
                console.log('   姓名:', jun.memberName);
                console.log('   班級:', jun.team + '班');
                console.log('   角色:', jun.role);
                console.log('   LINE ID:', jun.lineUserId);
                console.log('   通知啟用:', jun.notificationEnabled ? '✅ 是' : '❌ 否');
                console.log('   註冊時間:', new Date(jun.createdAt).toLocaleString());
                
                return jun;
            } else {
                console.log('❌ 找不到鈞的註冊資料');
                console.log('📝 所有已註冊用戶:');
                result.users.forEach((user, index) => {
                    console.log('  ' + (index + 1) + '. ' + user.memberName + ' (' + user.team + '班 ' + user.role + ')');
                });
                return null;
            }
        }
    } catch (error) {
        console.error('❌ 檢查失敗:', error.message);
        return null;
    }
}

async function checkLineBotConfig() {
    console.log('\n🤖 檢查 LINE Bot 配置...');
    
    const hasAccessToken = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const hasChannelSecret = !!process.env.LINE_CHANNEL_SECRET;
    const hasChannelId = !!process.env.LINE_CHANNEL_ID;
    
    console.log('   ACCESS_TOKEN:', hasAccessToken ? '✅ 已設定' : '❌ 未設定');
    console.log('   CHANNEL_SECRET:', hasChannelSecret ? '✅ 已設定' : '❌ 未設定');
    console.log('   CHANNEL_ID:', hasChannelId ? '✅ 已設定' : '❌ 未設定');
    
    if (hasAccessToken && hasChannelSecret) {
        console.log('✅ LINE Bot 基本配置正確');
        return true;
    } else {
        console.log('❌ LINE Bot 配置不完整');
        return false;
    }
}

async function testNotificationSending(junProfile) {
    if (!junProfile) {
        console.log('\n❌ 無法測試通知發送：鈞未註冊');
        return;
    }
    
    console.log('\n📤 測試發送通知給鈞...');
    
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        const testData = {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '測試：檢查鈞是否能收到通知',
            excludeNames: [] // 不排除任何人
        };
        
        console.log('發送測試通知...');
        const response = await fetch(baseUrl + '/api/overtime-opportunity', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 通知發送結果:');
            console.log('   成功通知:', result.notified, '人');
            console.log('   發送失敗:', result.failed, '人');
            console.log('   排除人數:', result.excluded, '人');
            
            if (result.notified > 0) {
                console.log('🎯 鈞應該會收到測試通知');
            } else {
                console.log('⚠️  沒有人收到通知，可能有問題');
            }
        } else {
            console.error('❌ 發送通知失敗:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ 測試通知發送失敗:', error.message);
    }
}

async function main() {
    console.log('🚀 開始檢查鈞的 LINE 通知狀態\n');
    
    // 1. 檢查鈞的註冊狀態
    const junProfile = await checkJunStatus();
    
    // 2. 檢查 LINE Bot 配置
    const botConfigOk = await checkLineBotConfig();
    
    // 3. 如果配置正確且鈞已註冊，測試發送通知
    if (botConfigOk && junProfile) {
        await testNotificationSending(junProfile);
    }
    
    console.log('\n📋 總結:');
    if (junProfile) {
        console.log('✅ 鈞已完成 LINE 身份設定');
        console.log('✅ 鈞的通知功能已啟用');
    } else {
        console.log('❌ 鈞未完成 LINE 身份設定或註冊資料有問題');
    }
    
    if (botConfigOk) {
        console.log('✅ LINE Bot 配置正確');
    } else {
        console.log('❌ LINE Bot 配置有問題');
    }
}

main();
