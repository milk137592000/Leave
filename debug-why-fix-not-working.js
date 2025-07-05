const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function debugWhyFixNotWorking() {
    console.log('🚨 緊急調查：為什麼修復後的系統還是不工作！\n');
    
    try {
        // 1. 檢查部署狀態
        console.log('1️⃣ 檢查Vercel部署狀態:');
        
        try {
            const response = await fetch('https://leave-ten.vercel.app/api/leave', {
                method: 'GET'
            });
            
            console.log(`   API狀態: ${response.status}`);
            
            if (response.status === 405) {
                console.log('   ✅ API端點存在（405 = Method Not Allowed for GET）');
            }
        } catch (error) {
            console.log(`   ❌ API連接失敗: ${error.message}`);
        }
        
        // 2. 檢查最新的請假記錄創建流程
        console.log('\n2️⃣ 模擬請假創建流程:');
        
        const testLeaveData = {
            date: '2025-07-08',
            name: '測試系統',
            team: 'B',
            period: 'fullDay',
            confirmed: false
        };
        
        console.log('   測試數據:', JSON.stringify(testLeaveData));
        
        try {
            const response = await fetch('https://leave-ten.vercel.app/api/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testLeaveData)
            });
            
            console.log(`   POST請求狀態: ${response.status}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('   ✅ 請假創建成功');
                console.log(`   返回數據: ${JSON.stringify(result)}`);
                
                // 檢查是否有自動設定加班需求
                if (result.fullDayOvertime) {
                    console.log('   ✅ 自動設定加班需求成功');
                    console.log('   ✅ 應該會觸發通知邏輯');
                } else {
                    console.log('   ❌ 沒有自動設定加班需求');
                    console.log('   ❌ 這就是問題所在！');
                }
                
                // 清理測試記錄
                try {
                    await fetch('https://leave-ten.vercel.app/api/leave', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            date: '2025-07-08',
                            name: '測試系統'
                        })
                    });
                    console.log('   ✅ 測試記錄已清理');
                } catch (error) {
                    console.log(`   ⚠️  清理測試記錄失敗: ${error.message}`);
                }
                
            } else {
                const errorText = await response.text();
                console.log(`   ❌ 請假創建失敗: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ 請假API調用失敗: ${error.message}`);
        }
        
        // 3. 檢查通知函數是否存在
        console.log('\n3️⃣ 檢查通知函數:');
        
        try {
            const response = await fetch('https://leave-ten.vercel.app/api/test-overtime-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testDate: '2025-07-08',
                    requesterName: '測試通知',
                    requesterTeam: 'B',
                    dryRun: true
                })
            });
            
            console.log(`   測試通知API狀態: ${response.status}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('   ✅ 通知API正常');
                console.log(`   符合資格人數: ${result.summary?.eligibleUsers || 0}`);
            } else {
                const errorText = await response.text();
                console.log(`   ❌ 通知API失敗: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ 通知API調用失敗: ${error.message}`);
        }
        
        // 4. 檢查環境變數
        console.log('\n4️⃣ 檢查關鍵環境變數:');
        console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '已設定' : '❌ 未設定'}`);
        console.log(`   LINE_CHANNEL_ACCESS_TOKEN: ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設定' : '❌ 未設定'}`);
        console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ 未設定'}`);
        
        // 5. 檢查實際的惟的記錄
        console.log('\n5️⃣ 檢查惟的實際記錄:');
        
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            
            const LeaveRecordSchema = new mongoose.Schema({
                date: String,
                name: String,
                team: String,
                period: mongoose.Schema.Types.Mixed,
                confirmed: Boolean,
                fullDayOvertime: mongoose.Schema.Types.Mixed,
                customOvertime: mongoose.Schema.Types.Mixed
            }, { timestamps: true });
            
            const LeaveRecord = mongoose.models.LeaveRecord || mongoose.model('LeaveRecord', LeaveRecordSchema);
            
            const weiRecord = await LeaveRecord.findOne({ 
                name: '惟',
                date: '2025-07-06'
            });
            
            if (weiRecord) {
                console.log(`   惟的記錄存在: ${weiRecord._id}`);
                console.log(`   創建時間: ${new Date(weiRecord.createdAt).toLocaleString('zh-TW')}`);
                console.log(`   全天加班: ${weiRecord.fullDayOvertime ? JSON.stringify(weiRecord.fullDayOvertime) : '無'}`);
                
                if (weiRecord.fullDayOvertime) {
                    console.log('   ✅ 有加班設定，但沒有觸發通知');
                    console.log('   🚨 這證明通知邏輯沒有被調用！');
                } else {
                    console.log('   ❌ 沒有加班設定');
                    console.log('   🚨 這證明自動加班設定邏輯沒有生效！');
                }
            } else {
                console.log('   ❌ 找不到惟的記錄');
            }
            
            await mongoose.disconnect();
        }
        
        console.log('\n🎯 問題診斷結論:');
        console.log('   如果惟的記錄有加班設定但沒有通知，說明：');
        console.log('   1. 自動加班設定邏輯生效了');
        console.log('   2. 但通知邏輯沒有被調用');
        console.log('   3. 可能是 sendLineOvertimeOpportunityNotificationDirect 函數沒有被正確調用');
        console.log('');
        console.log('   如果惟的記錄沒有加班設定，說明：');
        console.log('   1. 我們的修復代碼沒有部署到生產環境');
        console.log('   2. 或者修復邏輯有bug');

    } catch (error) {
        console.error('❌ 調查失敗:', error);
    }
}

// 執行調查
debugWhyFixNotWorking().catch(console.error);
