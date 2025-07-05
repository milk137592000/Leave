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

async function checkXianLeave() {
    console.log('🔍 檢查獻的實際請假記錄\n');
    
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

        // 1. 檢查所有包含"獻"的請假記錄
        console.log('1️⃣ 檢查所有包含"獻"的請假記錄:');
        const xianRecords = await LeaveRecord.find({ 
            name: { $regex: '獻', $options: 'i' }
        }).sort({ createdAt: -1 });
        
        console.log(`找到 ${xianRecords.length} 筆包含"獻"的記錄:`);
        xianRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      自定義加班: ${record.customOvertime ? JSON.stringify(record.customOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 2. 檢查最近的所有請假記錄
        console.log('2️⃣ 檢查最近的所有請假記錄:');
        const recentRecords = await LeaveRecord.find({}).sort({ createdAt: -1 }).limit(10);
        
        console.log(`最近 ${recentRecords.length} 筆請假記錄:`);
        recentRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 3. 檢查特定日期的記錄
        console.log('3️⃣ 檢查 2025-07-06 的所有請假記錄:');
        const dateRecords = await LeaveRecord.find({ date: '2025-07-06' });
        
        console.log(`2025-07-06 有 ${dateRecords.length} 筆請假記錄:`);
        dateRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.name} (${record.team}班)`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 4. 創建一個測試記錄來驗證通知邏輯
        console.log('4️⃣ 創建測試記錄驗證通知邏輯:');
        
        // 先清理舊的測試記錄
        await LeaveRecord.deleteMany({ name: '測試獻通知' });
        
        const testRecord = new LeaveRecord({
            date: '2025-07-12',
            name: '測試獻通知',
            team: 'B',
            period: 'fullDay',
            confirmed: false,
            fullDayOvertime: {
                type: '加一半',
                firstHalfMember: undefined,
                secondHalfMember: undefined
            }
        });

        const savedRecord = await testRecord.save();
        console.log('   ✅ 測試記錄創建成功');
        console.log(`   記錄ID: ${savedRecord._id}`);
        console.log(`   全天加班設定: ${JSON.stringify(savedRecord.fullDayOvertime)}`);
        
        // 檢查是否符合通知條件
        if (savedRecord.fullDayOvertime || savedRecord.customOvertime) {
            console.log('   ✅ 符合發送取消通知的條件');
        } else {
            console.log('   ❌ 不符合發送取消通知的條件');
        }
        
        // 清理測試記錄
        await LeaveRecord.deleteOne({ _id: savedRecord._id });
        console.log('   ✅ 測試記錄已清理');

        console.log('\n📋 分析結果:');
        console.log('如果獻取消請假時鈞沒收到通知，可能原因：');
        console.log('1. 獻的請假記錄沒有設定 fullDayOvertime 或 customOvertime');
        console.log('2. 前端取消請假時沒有傳遞足夠的參數');
        console.log('3. 後端通知邏輯有問題');
        console.log('4. LINE Bot 配置或網路問題');

    } catch (error) {
        console.error('❌ 檢查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行檢查
checkXianLeave().catch(console.error);
