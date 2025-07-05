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

async function checkWeiRecordNow() {
    console.log('🔍 檢查惟剛剛的請假記錄\n');
    
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

        // 檢查惟的最新記錄
        const weiRecord = await LeaveRecord.findOne({ 
            name: { $regex: '惟', $options: 'i' },
            date: '2025-07-06'
        });
        
        if (weiRecord) {
            const createTime = new Date(weiRecord.createdAt);
            const systemFixTime = new Date('2025-07-05T20:00:00+08:00');
            
            console.log('📋 惟的請假記錄詳情:');
            console.log(`   記錄ID: ${weiRecord._id}`);
            console.log(`   姓名: ${weiRecord.name}`);
            console.log(`   班級: ${weiRecord.team}`);
            console.log(`   日期: ${weiRecord.date}`);
            console.log(`   時段: ${JSON.stringify(weiRecord.period)}`);
            console.log(`   創建時間: ${createTime.toLocaleString('zh-TW')}`);
            console.log(`   全天加班: ${weiRecord.fullDayOvertime ? JSON.stringify(weiRecord.fullDayOvertime) : '無'}`);
            
            console.log('\n⏰ 時間分析:');
            console.log(`   系統修復時間: ${systemFixTime.toLocaleString('zh-TW')}`);
            console.log(`   惟請假時間: ${createTime.toLocaleString('zh-TW')}`);
            
            if (createTime > systemFixTime) {
                console.log('   ✅ 惟的請假在系統修復之後');
                console.log('   ✅ 有自動設定加班需求');
                console.log('   ✅ 應該已觸發通知邏輯');
                
                console.log('\n🎯 測試結果:');
                console.log('   如果鈞沒有收到通知，說明修復後的系統仍有問題！');
                console.log('   這是一個新的bug，需要進一步調查');
                
                // 手動補發通知
                console.log('\n🚀 手動補發通知給鈞:');
                
                if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
                    try {
                        const notificationMessage = {
                            type: 'text',
                            text: `🔔 加班機會通知\n\n📅 日期：2025-07-06\n👤 請假人員：B班 惟\n⏰ 時段：全天\n\n您的C班當天中班，可協助B班加班。\n\n如需確認加班，請點擊以下連結：\nhttps://leave-ten.vercel.app/leave/2025-07-06\n\n⚠️ 測試補發 - ${new Date().toLocaleTimeString('zh-TW')}`
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
                            console.log('   ✅ 惟請假0706的通知已補發給鈞！');
                            console.log('   📱 請檢查鈞是否收到這條補發的通知');
                        } else {
                            const errorText = await response.text();
                            console.log(`   ❌ 補發通知失敗: ${response.status} - ${errorText}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ 補發通知錯誤: ${error.message}`);
                    }
                }
                
            } else {
                console.log('   ❌ 惟的請假在系統修復之前');
                console.log('   💡 需要手動補發通知');
            }
            
        } else {
            console.log('❌ 沒有找到惟的0706請假記錄');
        }

        console.log('\n🔍 系統狀態檢查:');
        console.log('   如果修復後的請假仍然沒有自動發送通知，');
        console.log('   說明我們的修復還不完整，需要進一步調查！');

    } catch (error) {
        console.error('❌ 檢查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行檢查
checkWeiRecordNow().catch(console.error);
