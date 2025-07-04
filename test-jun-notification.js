/**
 * 測試鈞的通知接收狀態
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkJunRegistration() {
    console.log('🔍 檢查鈞的註冊狀態...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
        // 1. 檢查所有已註冊用戶
        console.log('📋 檢查所有已註冊用戶:');
        const usersResponse = await fetch(`${baseUrl}/api/line-admin/users`);
        
        if (usersResponse.ok) {
            const usersResult = await usersResponse.json();
            console.log(`總用戶數: ${usersResult.users ? usersResult.users.length : 0}\n`);
            
            if (usersResult.users) {
                // 查找鈞的資料
                const jun = usersResult.users.find(u => u.memberName === '鈞');
                if (jun) {
                    console.log('✅ 找到鈞的註冊資料:');
                    console.log(`   姓名: ${jun.memberName}`);
                    console.log(`   班級: ${jun.team}班`);
                    console.log(`   角色: ${jun.role}`);
                    console.log(`   LINE ID: ${jun.lineUserId}`);
                    console.log(`   通知啟用: ${jun.notificationEnabled ? '✅ 是' : '❌ 否'}`);
                    console.log(`   註冊時間: ${new Date(jun.createdAt).toLocaleString()}\n`);
                    
                    return jun;
                } else {
                    console.log('❌ 找不到鈞的註冊資料\n');
                    
                    // 列出所有用戶供參考
                    console.log('📝 所有已註冊用戶:');
                    usersResult.users.forEach((user, index) => {
                        console.log(`${index + 1}. ${user.memberName} (${user.team}班 ${user.role})`);
                    });
                    console.log('');
                    
                    return null;
                }
            }
        } else {
            console.error('❌ 無法獲取用戶列表:', await usersResponse.text());
            return null;
        }
    } catch (error) {
        console.error('❌ 檢查註冊狀態失敗:', error);
        return null;
    }
}

async function testCancellationNotification() {
    console.log('🧪 測試加班取消通知功能...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
        // 模擬惟取消請假的情況
        const testData = {
            date: '2025-07-05',
            requesterName: '惟',
            requesterTeam: 'B',
            reason: '測試：請假記錄已刪除',
            excludeNames: ['惟'] // 排除惟本人
        };

        console.log('📤 發送測試通知:');
        console.log(`   日期: ${testData.date}`);
        console.log(`   請假人: ${testData.requesterName} (${testData.requesterTeam}班)`);
        console.log(`   原因: ${testData.reason}`);
        console.log(`   排除人員: ${testData.excludeNames.join(', ')}\n`);

        const response = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ 通知發送結果:');
            console.log(`   成功通知: ${result.notified} 人`);
            console.log(`   發送失敗: ${result.failed} 人`);
            console.log(`   排除人數: ${result.excluded} 人`);
            console.log(`   排除人員: ${result.excludedNames ? result.excludedNames.join(', ') : '無'}\n`);
            
            if (result.notified > 0) {
                console.log('🎯 鈞應該會收到通知（如果已註冊且未被排除）');
            } else {
                console.log('⚠️  沒有人收到通知，可能的原因：');
                console.log('   1. 沒有已註冊的用戶');
                console.log('   2. 所有用戶都被排除');
                console.log('   3. LINE Bot 配置問題');
            }
            
            return result;
        } else {
            console.error('❌ 發送通知失敗:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('❌ 測試通知失敗:', error);
        return null;
    }
}

async function checkLineUserState() {
    console.log('🔍 檢查 LineUserState 中的用戶...\n');
    
    // 這裡我們無法直接查詢資料庫，但可以通過 API 間接檢查
    console.log('💡 提示：如果鈞沒有收到通知，可能的原因：');
    console.log('1. 鈞沒有在 UserProfile 中註冊');
    console.log('2. 鈞沒有在 LineUserState 中完成身份選擇');
    console.log('3. 鈞的 notificationEnabled 設為 false');
    console.log('4. 鈞被錯誤地排除在通知名單外');
    console.log('5. LINE Bot 發送訊息失敗\n');
}

async function debugNotificationLogic() {
    console.log('🐛 除錯通知邏輯...\n');
    
    console.log('📋 通知發送條件檢查：');
    console.log('1. ✅ LINE Bot 配置正確（有 ACCESS_TOKEN 和 SECRET）');
    console.log('2. ❓ 用戶在 UserProfile 中註冊且 notificationEnabled = true');
    console.log('3. ❓ 用戶在 LineUserState 中 step = "name_selected"');
    console.log('4. ❓ 用戶名稱不在 excludeNames 列表中');
    console.log('5. ❓ LINE API 發送成功\n');
    
    console.log('🔧 建議的檢查步驟：');
    console.log('1. 確認鈞已完成 LINE 身份設定');
    console.log('2. 檢查鈞的 notificationEnabled 狀態');
    console.log('3. 確認鈞不在排除名單中');
    console.log('4. 檢查 LINE Bot 日誌');
    console.log('5. 測試直接發送訊息給鈞\n');
}

async function main() {
    console.log('🚀 開始檢查鈞的通知接收問題\n');
    console.log('='.repeat(50) + '\n');
    
    // 1. 檢查鈞的註冊狀態
    const junProfile = await checkJunRegistration();
    
    console.log('='.repeat(50) + '\n');
    
    // 2. 測試通知發送
    const notificationResult = await testCancellationNotification();
    
    console.log('='.repeat(50) + '\n');
    
    // 3. 檢查 LineUserState
    await checkLineUserState();
    
    console.log('='.repeat(50) + '\n');
    
    // 4. 除錯建議
    await debugNotificationLogic();
    
    console.log('='.repeat(50) + '\n');
    
    // 5. 總結
    console.log('📊 檢查總結：');
    if (junProfile) {
        console.log('✅ 鈞已註冊');
        if (junProfile.notificationEnabled) {
            console.log('✅ 鈞的通知已啟用');
        } else {
            console.log('❌ 鈞的通知已停用');
        }
    } else {
        console.log('❌ 鈞未註冊或註冊資料有問題');
    }
    
    if (notificationResult && notificationResult.notified > 0) {
        console.log('✅ 通知發送成功');
    } else {
        console.log('❌ 通知發送失敗或沒有符合條件的用戶');
    }
    
    console.log('\n🎯 如果鈞仍然沒有收到通知，請檢查：');
    console.log('1. 鈞的 LINE 帳號是否正確綁定');
    console.log('2. 鈞是否在 LINE 中封鎖了機器人');
    console.log('3. LINE Bot 的權限設定');
    console.log('4. 網路連線狀況');
}

// 執行測試
if (require.main === module) {
    main();
}

module.exports = { checkJunRegistration, testCancellationNotification };
