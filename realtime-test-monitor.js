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

async function realtimeTestMonitor() {
    console.log('🧪 實時測試監控 - 等待惟請假0706\n');
    console.log(`⏰ 開始監控時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log('👀 監控目標: 惟請假0706，鈞是否收到通知\n');
    
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
        console.log('✅ MongoDB 連接成功');

        // 定義模型
        const LeaveRecord = mongoose.models.LeaveRecord || mongoose.model('LeaveRecord', LeaveRecordSchema);

        // 記錄開始時的記錄數量
        const initialCount = await LeaveRecord.countDocuments();
        console.log(`📊 當前總請假記錄數: ${initialCount}`);
        
        // 檢查是否已有惟的0706記錄
        const existingWeiRecord = await LeaveRecord.findOne({ 
            name: { $regex: '惟', $options: 'i' },
            date: '2025-07-06'
        });
        
        if (existingWeiRecord) {
            console.log('⚠️  警告: 已存在惟的0706請假記錄');
            console.log(`   創建時間: ${new Date(existingWeiRecord.createdAt).toLocaleString('zh-TW')}`);
            console.log(`   全天加班: ${existingWeiRecord.fullDayOvertime ? JSON.stringify(existingWeiRecord.fullDayOvertime) : '無'}`);
        } else {
            console.log('✅ 確認: 目前沒有惟的0706請假記錄');
        }
        
        console.log('\n🔄 開始實時監控...\n');

        // 實時監控循環
        let lastCheckTime = new Date();
        let checkCount = 0;
        
        const monitorInterval = setInterval(async () => {
            try {
                checkCount++;
                const currentTime = new Date();
                
                console.log(`[${currentTime.toLocaleTimeString('zh-TW')}] 檢查 #${checkCount}`);
                
                // 檢查是否有新的惟的記錄
                const weiRecord = await LeaveRecord.findOne({ 
                    name: { $regex: '惟', $options: 'i' },
                    date: '2025-07-06',
                    createdAt: { $gte: lastCheckTime }
                });
                
                if (weiRecord) {
                    console.log('\n🎯 發現惟的新請假記錄！');
                    console.log(`   創建時間: ${new Date(weiRecord.createdAt).toLocaleString('zh-TW')}`);
                    console.log(`   班級: ${weiRecord.team}`);
                    console.log(`   時段: ${JSON.stringify(weiRecord.period)}`);
                    console.log(`   全天加班: ${weiRecord.fullDayOvertime ? JSON.stringify(weiRecord.fullDayOvertime) : '無'}`);
                    
                    // 檢查是否有加班設定
                    if (weiRecord.fullDayOvertime && weiRecord.fullDayOvertime.type) {
                        console.log('   ✅ 有加班設定，應該會觸發通知');
                        
                        // 分析通知邏輯
                        console.log('\n📋 通知邏輯分析:');
                        console.log('   惟的班級: B班');
                        console.log('   鈞的班級: C班');
                        console.log('   0706 C班輪值: 中班');
                        console.log('   鈞符合通知條件: 是（中班可以協助B班加班）');
                        
                        console.log('\n⏰ 等待通知發送...');
                        console.log('   如果系統正常，鈞應該在幾秒內收到LINE通知');
                        console.log('   請檢查鈞的LINE是否收到加班機會通知！');
                        
                    } else {
                        console.log('   ❌ 沒有加班設定，不會觸發通知');
                        console.log('   這表示自動加班設定邏輯可能有問題');
                    }
                    
                    // 停止監控
                    clearInterval(monitorInterval);
                    
                    // 等待一段時間後檢查結果
                    setTimeout(async () => {
                        console.log('\n📱 測試結果確認:');
                        console.log('請確認以下問題:');
                        console.log('1. 鈞是否收到了惟請假0706的LINE通知？');
                        console.log('2. 通知內容是否正確？');
                        console.log('3. 通知時間是否及時？');
                        
                        if (weiRecord.fullDayOvertime && weiRecord.fullDayOvertime.type) {
                            console.log('\n✅ 系統邏輯正常: 有加班設定，應該發送通知');
                        } else {
                            console.log('\n❌ 系統邏輯異常: 沒有自動設定加班需求');
                        }
                        
                        await mongoose.disconnect();
                        console.log('\n🔚 監控結束');
                    }, 10000); // 等待10秒
                    
                    return;
                }
                
                // 檢查是否有任何新記錄
                const newRecordsCount = await LeaveRecord.countDocuments();
                if (newRecordsCount > initialCount) {
                    const newRecords = await LeaveRecord.find({
                        createdAt: { $gte: lastCheckTime }
                    }).sort({ createdAt: -1 });
                    
                    console.log(`   發現 ${newRecords.length} 筆新記錄:`);
                    newRecords.forEach(record => {
                        console.log(`     - ${record.name} 請假 ${record.date}`);
                    });
                }
                
                lastCheckTime = currentTime;
                
                // 5分鐘後自動停止監控
                if (checkCount >= 60) { // 每5秒檢查一次，60次 = 5分鐘
                    console.log('\n⏰ 監控時間到，自動停止');
                    console.log('如果惟還沒請假，請重新運行監控腳本');
                    clearInterval(monitorInterval);
                    await mongoose.disconnect();
                }
                
            } catch (error) {
                console.error(`檢查錯誤: ${error.message}`);
            }
        }, 5000); // 每5秒檢查一次

    } catch (error) {
        console.error('❌ 監控失敗:', error);
    }
}

// 執行實時監控
realtimeTestMonitor().catch(console.error);
