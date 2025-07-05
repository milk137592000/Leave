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

async function debugOvertimeNotification() {
    console.log('🔍 調查 0706 瑋請假，鈞未收到加班通知的問題...\n');
    
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

        // 1. 檢查鈞的註冊狀態
        console.log('1️⃣ 檢查鈞的註冊狀態:');
        const junProfile = await UserProfile.findOne({ memberName: '鈞' });
        if (junProfile) {
            console.log('✅ 鈞已註冊:');
            console.log(`   - LINE User ID: ${junProfile.lineUserId}`);
            console.log(`   - 顯示名稱: ${junProfile.displayName}`);
            console.log(`   - 班級: ${junProfile.team}`);
            console.log(`   - 角色: ${junProfile.role}`);
            console.log(`   - 通知啟用: ${junProfile.notificationEnabled}`);
            console.log(`   - 註冊時間: ${junProfile.createdAt}`);
        } else {
            console.log('❌ 鈞未註冊在 UserProfile 系統中');
        }
        console.log('');

        // 2. 檢查瑋的註冊狀態
        console.log('2️⃣ 檢查瑋的註冊狀態:');
        const weiProfile = await UserProfile.findOne({ memberName: '瑋' });
        if (weiProfile) {
            console.log('✅ 瑋已註冊:');
            console.log(`   - LINE User ID: ${weiProfile.lineUserId}`);
            console.log(`   - 顯示名稱: ${weiProfile.displayName}`);
            console.log(`   - 班級: ${weiProfile.team}`);
            console.log(`   - 角色: ${weiProfile.role}`);
            console.log(`   - 通知啟用: ${weiProfile.notificationEnabled}`);
        } else {
            console.log('❌ 瑋未註冊在 UserProfile 系統中');
        }
        console.log('');

        // 3. 檢查 2025-07-06 的請假記錄
        console.log('3️⃣ 檢查 2025-07-06 的請假記錄:');
        const leaveRecords = await LeaveRecord.find({ date: '2025-07-06' });
        if (leaveRecords.length > 0) {
            console.log(`✅ 找到 ${leaveRecords.length} 筆請假記錄:`);
            leaveRecords.forEach((record, index) => {
                console.log(`   記錄 ${index + 1}:`);
                console.log(`   - 姓名: ${record.name}`);
                console.log(`   - 班級: ${record.team}`);
                console.log(`   - 時段: ${JSON.stringify(record.period)}`);
                console.log(`   - 已確認: ${record.confirmed}`);
                console.log(`   - 全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
                console.log(`   - 創建時間: ${record.createdAt}`);
                console.log('');
            });
        } else {
            console.log('❌ 沒有找到 2025-07-06 的請假記錄');
        }
        console.log('');

        // 4. 檢查所有註冊用戶
        console.log('4️⃣ 檢查所有註冊用戶:');
        const allUsers = await UserProfile.find({}).sort({ team: 1, memberName: 1 });
        console.log(`總共有 ${allUsers.length} 位註冊用戶:`);
        allUsers.forEach(user => {
            console.log(`   - ${user.team}班 ${user.memberName} (${user.role}) - 通知: ${user.notificationEnabled ? '啟用' : '停用'}`);
        });
        console.log('');

        // 5. 計算班別輪值
        console.log('5️⃣ 計算 2025-07-06 各班別輪值:');
        const SHIFT_CYCLE = ['大休', '早班', '早班', '中班', '中班', '小休', '夜班', '夜班'];
        const TEAM_START_POSITIONS = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
        
        const targetDate = new Date('2025-07-06');
        const startDate = new Date('2025-04-01');
        const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`   從 2025-04-01 到 2025-07-06 相差 ${daysDiff} 天`);
        
        Object.entries(TEAM_START_POSITIONS).forEach(([team, startPos]) => {
            const cyclePosition = (startPos + daysDiff) % 8;
            const shift = SHIFT_CYCLE[cyclePosition];
            console.log(`   - ${team}班: ${shift} (位置 ${cyclePosition})`);
        });
        console.log('');

        // 6. 分析問題
        console.log('6️⃣ 問題分析:');
        if (!junProfile) {
            console.log('❌ 主要問題: 鈞未註冊在系統中，因此無法收到任何通知');
        } else if (!junProfile.notificationEnabled) {
            console.log('❌ 主要問題: 鈞的通知功能已停用');
        } else {
            // 計算鈞的班別輪值
            const junTeam = junProfile.team;
            const junCyclePosition = (TEAM_START_POSITIONS[junTeam] + daysDiff) % 8;
            const junShift = SHIFT_CYCLE[junCyclePosition];
            
            console.log(`   鈞的班級 ${junTeam} 在 2025-07-06 的輪值: ${junShift}`);
            
            if (junShift !== '大休' && junShift !== '小休') {
                console.log('❌ 問題: 根據現有邏輯，只有大休或小休的班級才會收到加班通知');
                console.log(`   鈞的班級當天是 ${junShift}，不符合通知條件`);
            } else {
                console.log('✅ 鈞的班級符合通知條件，可能是其他問題');
            }
        }

    } catch (error) {
        console.error('❌ 執行失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行調查
debugOvertimeNotification().catch(console.error);
