/**
 * 測試直接發送訊息給鈞
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testDirectMessage() {
    console.log('📱 測試直接發送 LINE 訊息給鈞...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';

    try {
        // 1. 先獲取鈞的 LINE ID
        console.log('1️⃣ 獲取鈞的 LINE ID...');
        const usersResponse = await fetch(`${baseUrl}/api/line-admin/users`);
        
        if (!usersResponse.ok) {
            throw new Error(`無法獲取用戶列表: ${usersResponse.status}`);
        }
        
        const usersResult = await usersResponse.json();
        const jun = usersResult.users?.find(u => u.memberName === '鈞');
        
        if (!jun) {
            console.log('❌ 找不到鈞的註冊記錄');
            return;
        }
        
        console.log(`✅ 找到鈞的 LINE ID: ${jun.lineUserId}\n`);
        
        // 2. 測試直接發送訊息
        console.log('2️⃣ 發送測試訊息...');
        
        const testData = {
            lineUserId: jun.lineUserId,
            message: '🧪 測試訊息：鈞您好！這是直接發送的測試通知。如果收到此訊息，請回覆「收到測試訊息」。'
        };

        console.log(`發送目標: ${jun.memberName} (${jun.team}班 ${jun.role})`);
        console.log(`LINE ID: ${jun.lineUserId}`);
        console.log(`訊息內容: ${testData.message}\n`);
        
        const response = await fetch(`${baseUrl}/api/test-direct-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log(`HTTP 狀態: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 測試訊息發送成功!');
            console.log('回應:', JSON.stringify(result, null, 2));
            console.log('\n🎯 請檢查鈞是否收到測試訊息');
        } else {
            const errorText = await response.text();
            console.error('❌ 測試訊息發送失敗:');
            console.error('錯誤內容:', errorText);
            
            // 分析可能的錯誤原因
            if (response.status === 400) {
                console.log('\n💡 可能原因：LINE User ID 無效或格式錯誤');
            } else if (response.status === 403) {
                console.log('\n💡 可能原因：LINE Bot 權限不足或被封鎖');
            } else if (response.status === 500) {
                console.log('\n💡 可能原因：LINE API 配置錯誤或服務異常');
            }
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

async function checkLineConfig() {
    console.log('\n🔧 檢查 LINE Bot 配置...\n');
    
    const hasAccessToken = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const hasChannelSecret = !!process.env.LINE_CHANNEL_SECRET;
    
    console.log(`ACCESS_TOKEN: ${hasAccessToken ? '✅ 已設定' : '❌ 未設定'}`);
    console.log(`CHANNEL_SECRET: ${hasChannelSecret ? '✅ 已設定' : '❌ 未設定'}`);
    
    if (hasAccessToken && hasChannelSecret) {
        console.log('✅ LINE Bot 基本配置正確');
        
        // 檢查 Token 格式
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
            if (token.length > 50) {
                console.log('✅ ACCESS_TOKEN 長度正常');
            } else {
                console.log('⚠️  ACCESS_TOKEN 長度可能不正確');
            }
        }
    } else {
        console.log('❌ LINE Bot 配置不完整');
    }
}

async function suggestSolutions() {
    console.log('\n🔍 可能的解決方案:\n');
    
    console.log('1. **檢查 LINE Bot 設定**');
    console.log('   - 確認 Channel Access Token 是否正確');
    console.log('   - 確認 Channel Secret 是否正確');
    console.log('   - 檢查 LINE Developers Console 中的設定');
    
    console.log('\n2. **檢查 LINE Bot 權限**');
    console.log('   - 確認 Bot 有發送訊息的權限');
    console.log('   - 檢查是否被用戶封鎖');
    console.log('   - 確認 Bot 是否為好友');
    
    console.log('\n3. **檢查用戶狀態**');
    console.log('   - 鈞是否已加 Bot 為好友');
    console.log('   - 鈞是否封鎖了 Bot');
    console.log('   - LINE ID 是否正確');
    
    console.log('\n4. **檢查網路連線**');
    console.log('   - Vercel 到 LINE API 的連線');
    console.log('   - 防火牆或網路限制');
    
    console.log('\n5. **檢查 LINE API 狀態**');
    console.log('   - LINE API 是否正常運作');
    console.log('   - 是否達到發送限制');
}

async function main() {
    console.log('🚀 開始測試直接發送訊息給鈞\n');
    console.log('='.repeat(50) + '\n');
    
    await checkLineConfig();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testDirectMessage();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    await suggestSolutions();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🎯 下一步：');
    console.log('1. 檢查鈞是否收到測試訊息');
    console.log('2. 如果沒收到，檢查 LINE Bot 設定');
    console.log('3. 確認鈞已加 Bot 為好友且未封鎖');
    console.log('4. 檢查 Vercel 函數日誌');
}

main();
