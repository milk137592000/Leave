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

async function debugXian0705() {
    console.log('🔍 緊急調查獻0705請假0706的問題\n');
    
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

        // 1. 檢查獻的所有請假記錄，按時間排序
        console.log('1️⃣ 檢查獻的所有請假記錄:');
        const xianRecords = await LeaveRecord.find({ 
            name: { $regex: '獻', $options: 'i' }
        }).sort({ createdAt: -1 });
        
        console.log(`找到 ${xianRecords.length} 筆包含"獻"的記錄:`);
        xianRecords.forEach((record, index) => {
            const createTime = new Date(record.createdAt);
            console.log(`   ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`      創建時間: ${createTime.toLocaleString('zh-TW')}`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log('');
        });

        // 2. 特別檢查0705 12:13左右的記錄
        console.log('2️⃣ 檢查0705 12:13左右的記錄:');
        const targetTime = new Date('2025-07-05T12:13:00+08:00');
        const timeRange = 10 * 60 * 1000; // 10分鐘範圍
        
        const recordsAroundTime = await LeaveRecord.find({
            createdAt: {
                $gte: new Date(targetTime.getTime() - timeRange),
                $lte: new Date(targetTime.getTime() + timeRange)
            }
        }).sort({ createdAt: 1 });
        
        console.log(`在 ${targetTime.toLocaleString('zh-TW')} 前後10分鐘內的記錄:`);
        recordsAroundTime.forEach((record, index) => {
            const createTime = new Date(record.createdAt);
            console.log(`   ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`      創建時間: ${createTime.toLocaleString('zh-TW')}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log('');
        });

        // 3. 檢查0706的所有記錄
        console.log('3️⃣ 檢查0706的所有記錄:');
        const date0706Records = await LeaveRecord.find({ date: '2025-07-06' }).sort({ createdAt: 1 });
        
        console.log(`2025-07-06 有 ${date0706Records.length} 筆請假記錄:`);
        date0706Records.forEach((record, index) => {
            const createTime = new Date(record.createdAt);
            console.log(`   ${index + 1}. ${record.name} (${record.team}班)`);
            console.log(`      創建時間: ${createTime.toLocaleString('zh-TW')}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log('');
        });

        // 4. 分析時間線
        console.log('4️⃣ 時間線分析:');
        
        const systemFixTime = new Date('2025-07-05T20:00:00+08:00'); // 估計修復時間
        
        console.log(`   系統修復時間: ${systemFixTime.toLocaleString('zh-TW')}`);
        
        // 找到獻請假0706的記錄
        const xian0706Record = xianRecords.find(r => r.date === '2025-07-06');
        
        if (xian0706Record) {
            const recordTime = new Date(xian0706Record.createdAt);
            console.log(`   獻請假0706時間: ${recordTime.toLocaleString('zh-TW')}`);
            
            if (recordTime < systemFixTime) {
                console.log('   ❌ 獻的請假在系統修復之前，當時通知邏輯有問題');
                console.log('   💡 需要手動補發通知');
                
                // 立即手動發送通知
                console.log('\n🚀 立即手動發送通知給鈞:');
                
                if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
                    try {
                        const notificationMessage = {
                            type: 'text',
                            text: `🔔 加班機會通知\n\n📅 日期：2025-07-06\n👤 請假人員：B班 獻\n⏰ 時段：全天\n\n您的C班當天中班，可協助B班加班。\n\n如需確認加班，請點擊以下連結：\nhttps://leave-ten.vercel.app/leave/2025-07-06\n\n⚠️ 補發通知 - 系統修復後補發`
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
                            console.log('   ✅ 獻請假0706的通知已補發給鈞！');
                        } else {
                            const errorText = await response.text();
                            console.log(`   ❌ 補發通知失敗: ${response.status} - ${errorText}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ 補發通知錯誤: ${error.message}`);
                    }
                }
            } else {
                console.log('   ✅ 獻的請假在系統修復之後，應該有發送通知');
                console.log('   🤔 如果沒收到，可能是其他問題');
            }
        } else {
            console.log('   ❌ 沒有找到獻請假0706的記錄');
        }

        // 5. 檢查是否有其他同時間的請假
        console.log('\n5️⃣ 檢查是否有其他同時間的請假影響:');
        
        const sameTimeRecords = recordsAroundTime.filter(r => 
            r.name.includes('獻') && r.date === '2025-07-06'
        );
        
        if (sameTimeRecords.length > 1) {
            console.log('   ⚠️  發現多筆獻的同時間請假記錄，可能有重複或衝突');
            sameTimeRecords.forEach((record, index) => {
                console.log(`     ${index + 1}. ID: ${record._id}`);
                console.log(`        創建時間: ${new Date(record.createdAt).toLocaleString('zh-TW')}`);
            });
        } else {
            console.log('   ✅ 沒有發現重複記錄');
        }

        console.log('\n🎯 結論:');
        console.log('   如果鈞剛剛收到了補發的通知，說明問題是時間順序造成的');
        console.log('   系統現在已經修復，新的請假會正常發送通知');

    } catch (error) {
        console.error('❌ 調查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行調查
debugXian0705().catch(console.error);
