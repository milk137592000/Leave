require('dotenv').config({ path: '.env.local' });

async function testOvertimeOpportunityAPI() {
    try {
        console.log('🧪 測試加班機會API...\n');
        
        // 模擬科（D班）請假的數據
        const testData = {
            leaveRecordId: '66866b5e123456789abcdef0', // 假的ID，用於測試
            date: '2025-07-04',
            requesterName: '科',
            requesterTeam: 'D',
            overtimeType: '加全天'
        };
        
        console.log('📋 測試數據:');
        console.log(JSON.stringify(testData, null, 2));
        
        // 發送POST請求到加班機會API
        const response = await fetch('https://leave-ten.vercel.app/api/overtime-opportunity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('\n📊 API回應:');
        console.log('狀態碼:', response.status);
        console.log('回應內容:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('\n✅ API調用成功！');
            console.log(`📈 符合資格的用戶: ${result.totalEligible || 0}`);
            console.log(`📤 成功通知: ${result.notified || 0}`);
            
            if (result.eligibleUsers && result.eligibleUsers.length > 0) {
                console.log('\n👥 符合資格的用戶:');
                result.eligibleUsers.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.memberName} (${user.team}班 ${user.role}) - ${user.reason}`);
                });
            }
        } else {
            console.log('\n❌ API調用失敗');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

async function testUserProfiles() {
    try {
        console.log('\n🔍 檢查用戶資料...\n');
        
        // 獲取所有用戶
        const response = await fetch('https://leave-ten.vercel.app/api/line-admin/users');
        const result = await response.json();
        
        if (response.ok && result.users) {
            console.log(`📊 總用戶數: ${result.users.length}\n`);
            
            result.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.memberName} (${user.team}班 ${user.role})`);
                console.log(`   LINE ID: ${user.lineUserId}`);
                console.log(`   通知啟用: ${user.notificationEnabled ? '✅' : '❌'}`);
                console.log(`   註冊時間: ${new Date(user.createdAt).toLocaleString()}\n`);
            });
            
            // 特別檢查鈞的資料
            const jun = result.users.find(u => u.memberName === '鈞');
            if (jun) {
                console.log('🎯 鈞的詳細資料:');
                console.log(JSON.stringify(jun, null, 2));
            } else {
                console.log('❌ 找不到鈞的資料');
            }
        }
        
    } catch (error) {
        console.error('❌ 檢查用戶資料失敗:', error);
    }
}

async function testEligibilityLogic() {
    try {
        console.log('\n🧮 測試加班資格邏輯...\n');
        
        // 模擬檢查鈞是否符合科請假的加班資格
        const memberName = '鈞';
        const memberTeam = 'C';
        const requesterName = '科';
        const requesterTeam = 'D';
        const date = '2025-07-04';
        
        console.log('📋 檢查條件:');
        console.log(`👤 檢查者: ${memberName} (${memberTeam}班)`);
        console.log(`🏃 請假者: ${requesterName} (${requesterTeam}班)`);
        console.log(`📅 日期: ${date}\n`);
        
        // 檢查邏輯
        console.log('🔍 資格檢查:');
        
        // 1. 不能為自己加班
        const isSelf = memberName === requesterName;
        console.log(`1. 是否為自己: ${isSelf ? '❌ 是' : '✅ 否'}`);
        
        // 2. 不能為同班同事加班
        const isSameTeam = memberTeam === requesterTeam;
        console.log(`2. 是否同班: ${isSameTeam ? '❌ 是' : '✅ 否'}`);
        
        // 3. 檢查班別輪值
        console.log(`3. 班別檢查: ${memberTeam}班 vs ${requesterTeam}班`);
        
        const isEligible = !isSelf && !isSameTeam;
        console.log(`\n🎯 最終結果: ${isEligible ? '✅ 符合資格' : '❌ 不符合資格'}`);
        
        if (isEligible) {
            console.log(`📝 原因: ${memberTeam}班可以協助${requesterTeam}班加班`);
        }
        
    } catch (error) {
        console.error('❌ 測試資格邏輯失敗:', error);
    }
}

async function main() {
    console.log('🚀 開始測試加班通知完整流程...\n');
    console.log('=' * 50);
    
    // 1. 檢查用戶資料
    await testUserProfiles();
    
    console.log('\n' + '=' * 50);
    
    // 2. 測試資格邏輯
    await testEligibilityLogic();
    
    console.log('\n' + '=' * 50);
    
    // 3. 測試API
    await testOvertimeOpportunityAPI();
    
    console.log('\n🎯 測試完成！');
}

main().catch(console.error);
