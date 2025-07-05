const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 定義 Schema
const UserProfileSchema = new mongoose.Schema({
    lineUserId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    pictureUrl: { type: String, required: false },
    team: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    role: { type: String, required: true, enum: ['班長', '班員'] },
    memberName: { type: String, required: true },
    notificationEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const LeaveRecordSchema = new mongoose.Schema({
    date: { type: String, required: true, index: true },
    name: { type: String, required: true },
    team: { type: String },
    period: { type: mongoose.Schema.Types.Mixed, required: true },
    confirmed: { type: Boolean, required: true, default: false },
    fullDayOvertime: { type: mongoose.Schema.Types.Mixed, required: false },
    customOvertime: { type: mongoose.Schema.Types.Mixed, required: false }
}, { timestamps: true });

async function debugNotificationFlow() {
    console.log('🔍 調查通知流程問題\n');
    
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
        const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);
        const LeaveRecord = mongoose.models.LeaveRecord || mongoose.model('LeaveRecord', LeaveRecordSchema);

        // 1. 檢查最近的請假記錄
        console.log('1️⃣ 檢查最近的請假記錄:');
        const recentLeaves = await LeaveRecord.find({
            date: { $gte: '2025-07-06' }
        }).sort({ createdAt: -1 }).limit(10);
        
        console.log(`找到 ${recentLeaves.length} 筆最近的請假記錄:`);
        recentLeaves.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.team}班 ${record.name}`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 2. 檢查獻的請假記錄
        console.log('2️⃣ 檢查獻的請假記錄:');
        const xianLeaves = await LeaveRecord.find({ name: '獻' }).sort({ createdAt: -1 });
        console.log(`獻總共有 ${xianLeaves.length} 筆請假記錄:`);
        xianLeaves.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.team}班`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 3. 檢查瑋的請假記錄
        console.log('3️⃣ 檢查瑋的請假記錄:');
        const weiLeaves = await LeaveRecord.find({ name: '瑋' }).sort({ createdAt: -1 });
        console.log(`瑋總共有 ${weiLeaves.length} 筆請假記錄:`);
        weiLeaves.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.team}班`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 4. 檢查所有註冊用戶
        console.log('4️⃣ 檢查所有註冊用戶:');
        const allUsers = await UserProfile.find({}).sort({ team: 1, memberName: 1 });
        console.log(`總共有 ${allUsers.length} 位註冊用戶:`);
        allUsers.forEach(user => {
            console.log(`   - ${user.team}班 ${user.memberName} (${user.role}) - 通知: ${user.notificationEnabled ? '啟用' : '停用'} - LINE ID: ${user.lineUserId}`);
        });
        console.log('');

        // 5. 分析通知邏輯問題
        console.log('5️⃣ 分析通知邏輯問題:');
        
        // 檢查是否有獻的最新請假記錄
        const latestXianLeave = await LeaveRecord.findOne({ name: '獻' }).sort({ createdAt: -1 });
        if (latestXianLeave) {
            console.log('獻的最新請假記錄:');
            console.log(`   日期: ${latestXianLeave.date}`);
            console.log(`   班級: ${latestXianLeave.team}`);
            console.log(`   全天加班設定: ${latestXianLeave.fullDayOvertime ? JSON.stringify(latestXianLeave.fullDayOvertime) : '無'}`);
            
            // 檢查是否有加班需求
            if (!latestXianLeave.fullDayOvertime || !latestXianLeave.fullDayOvertime.type) {
                console.log('   ❌ 問題: 沒有設定加班需求，因此不會發送加班通知');
            } else {
                console.log('   ✅ 有加班需求，應該會發送通知');
            }
        } else {
            console.log('❌ 沒有找到獻的請假記錄');
        }

        // 6. 檢查環境變數
        console.log('\n6️⃣ 檢查LINE Bot配置:');
        console.log(`   LINE_CHANNEL_ACCESS_TOKEN: ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設定' : '❌ 未設定'}`);
        console.log(`   LINE_CHANNEL_SECRET: ${process.env.LINE_CHANNEL_SECRET ? '已設定' : '❌ 未設定'}`);
        console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`);

    } catch (error) {
        console.error('❌ 調查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行調查
debugNotificationFlow().catch(console.error);
