require('dotenv').config({ path: '.env.local' });

async function createTestLeaveRecord() {
    try {
        console.log('🧪 創建測試請假記錄（非代理請假）...\n');
        
        // 創建一個真實的請假記錄（科自己請假，不是代理）
        const leaveData = {
            date: '2025-07-06',
            name: '科',
            team: 'D',
            period: 'fullDay',
            reason: '測試：科自己請假',
            fullDayOvertime: {
                type: '加全天'
            }
        };
        
        console.log('📋 請假數據:');
        console.log(JSON.stringify(leaveData, null, 2));
        
        // 發送POST請求創建請假記錄
        const response = await fetch('https://leave-ten.vercel.app/api/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leaveData)
        });
        
        const result = await response.json();
        
        console.log('\n📊 創建結果:');
        console.log('狀態碼:', response.status);
        
        if (response.ok) {
            console.log('✅ 請假記錄創建成功！');
            console.log('記錄ID:', result._id);
            console.log('日期:', result.date);
            console.log('請假人:', result.name);
            console.log('班級:', result.team);
            
            // 等待一下讓通知系統處理
            console.log('\n⏳ 等待通知系統處理...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('✅ 如果系統正常，鈞應該已經收到加班通知！');
            console.log('📱 請檢查鈞的LINE是否收到：「D班科請假，C班可以加班」的通知');
            
        } else {
            console.log('❌ 創建失敗:', result.error || result);
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

async function main() {
    console.log('🚀 測試真實請假記錄的加班通知...\n');
    console.log('=' * 50);
    
    await createTestLeaveRecord();
    
    console.log('\n🎯 測試完成！');
    console.log('\n💡 說明：');
    console.log('- 0704科和0705惟的請假都是鈞代理請假的');
    console.log('- 系統正確地沒有通知代理人（鈞）自己去加班');
    console.log('- 這個測試創建了科自己的請假記錄');
    console.log('- 現在鈞應該會收到加班通知了！');
}

main().catch(console.error);
