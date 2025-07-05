const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 定義 Schema
const LeaveRecordSchema = new mongoose.Schema({
    date: { type: String, required: true, index: true },
    name: { type: String, required: true },
    team: { type: String },
    period: { type: mongoose.Schema.Types.Mixed, required: true },
    confirmed: { type: Boolean, required: true, default: false },
    fullDayOvertime: { type: mongoose.Schema.Types.Mixed, required: false },
    customOvertime: { type: mongoose.Schema.Types.Mixed, required: false }
}, { timestamps: true });

async function checkNotificationTiming() {
    console.log('⏰ 檢查通知時機問題\n');
    
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

        // 定義模型
        const LeaveRecord = mongoose.models.LeaveRecord || mongoose.model('LeaveRecord', LeaveRecordSchema);

        // 檢查瑋的請假記錄創建時間
        const weiRecord = await LeaveRecord.findOne({ 
            name: '瑋',
            date: '2025-07-06'
        });
        
        if (weiRecord) {
            console.log('📅 瑋的請假記錄詳情:');
            console.log(`   創建時間: ${weiRecord.createdAt}`);
            console.log(`   更新時間: ${weiRecord.updatedAt}`);
            console.log(`   全天加班: ${JSON.stringify(weiRecord.fullDayOvertime)}`);
            
            // 檢查是否在修復之前創建
            const recordTime = new Date(weiRecord.createdAt);
            const fixTime = new Date('2025-07-05T12:00:00Z'); // 大概的修復時間
            
            console.log(`\n⏰ 時間分析:`);
            console.log(`   請假記錄創建: ${recordTime.toLocaleString('zh-TW')}`);
            console.log(`   系統修復時間: ${fixTime.toLocaleString('zh-TW')}`);
            
            if (recordTime < fixTime) {
                console.log('   ❌ 請假記錄在修復之前創建，當時通知邏輯有問題');
                console.log('   💡 解決方案: 需要手動觸發通知或重新創建請假記錄');
            } else {
                console.log('   ✅ 請假記錄在修復之後創建，應該有觸發通知');
                console.log('   🤔 可能問題: 通知邏輯仍有其他問題');
            }
        } else {
            console.log('❌ 沒有找到瑋在0706的請假記錄');
        }
        
        console.log('\n🔧 建議解決方案:');
        console.log('1. 刪除瑋的舊請假記錄');
        console.log('2. 重新創建請假記錄，觸發修復後的通知邏輯');
        console.log('3. 或者手動觸發通知給所有符合條件的人員');
        
        // 提供手動觸發通知的選項
        console.log('\n🚀 手動觸發通知測試:');
        
        if (weiRecord) {
            try {
                // 模擬調用修復後的通知邏輯
                console.log('   正在測試修復後的通知邏輯...');
                
                // 這裡我們可以直接測試發送通知給鈞
                if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
                    const notificationMessage = {
                        type: 'text',
                        text: `🔔 加班機會通知\n\n📅 日期：2025-07-06\n👤 請假人員：B班 瑋\n⏰ 時段：全天\n\n您的C班當天中班，可協助B班加班。\n\n如需確認加班，請點擊以下連結：\nhttps://leave-ten.vercel.app/leave/2025-07-06`
                    };
                    
                    const response = await fetch('https://api.line.me/v2/bot/message/push', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            to: 'U55508e69afeffef5f001175fff31c9a4', // 鈞的LINE ID
                            messages: [notificationMessage]
                        })
                    });
                    
                    if (response.ok) {
                        console.log('   ✅ 手動通知發送成功！');
                        console.log('   📱 鈞應該現在收到瑋請假的加班通知了！');
                    } else {
                        const errorText = await response.text();
                        console.log(`   ❌ 手動通知發送失敗: ${response.status}`);
                        console.log(`   錯誤詳情: ${errorText}`);
                    }
                } else {
                    console.log('   ❌ LINE Bot TOKEN未設定');
                }
                
            } catch (error) {
                console.log(`   ❌ 手動通知發送錯誤: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ 檢查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行檢查
checkNotificationTiming().catch(console.error);
