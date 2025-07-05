const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function manualTestWeiNotification() {
    console.log('🧪 手動測試惟的通知邏輯\n');
    
    if (!process.env.MONGODB_URI) {
        console.error('❌ 錯誤: 請在 .env.local 檔案中設定 MONGODB_URI');
        process.exit(1);
    }

    try {
        // 連接到 MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log('✅ MongoDB 連接成功\n');

        // 模擬調用通知邏輯
        console.log('🚀 手動調用通知邏輯:');
        
        try {
            // 直接調用我們修復的通知函數
            const { sendLineOvertimeOpportunityNotificationDirect } = await import('./src/services/lineBot.js');
            
            const result = await sendLineOvertimeOpportunityNotificationDirect({
                date: '2025-07-06',
                requesterName: '惟',
                requesterTeam: 'B',
                period: '全天',
                overtimeType: '加一半'
            });

            console.log('✅ 通知邏輯執行完成');
            console.log(`   發送成功: ${result.success} 人`);
            console.log(`   發送失敗: ${result.failed} 人`);
            console.log(`   總用戶數: ${result.total} 人`);
            
            if (result.success > 0) {
                console.log('🎉 鈞應該收到惟請假的通知了！');
            } else if (result.total === 0) {
                console.log('❌ 沒有找到任何註冊用戶');
            } else {
                console.log('❌ 所有通知發送都失敗了');
            }

        } catch (error) {
            console.log(`❌ 通知邏輯執行失敗: ${error.message}`);
            console.log('詳細錯誤:', error);
        }
        
        // 檢查為什麼生產環境沒有調用
        console.log('\n🔍 檢查生產環境調用問題:');
        
        // 模擬生產環境的調用
        try {
            const response = await fetch('https://leave-ten.vercel.app/api/overtime-opportunity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leaveRecordId: '6868a7550df356ff65d902af', // 惟的記錄ID
                    date: '2025-07-06',
                    requesterName: '惟',
                    requesterTeam: 'B',
                    overtimeType: '加一半'
                })
            });
            
            console.log(`   API調用狀態: ${response.status}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('   ✅ API調用成功');
                console.log(`   結果: ${JSON.stringify(result)}`);
            } else {
                const errorText = await response.text();
                console.log(`   ❌ API調用失敗: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ API調用錯誤: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行測試
manualTestWeiNotification().catch(console.error);
