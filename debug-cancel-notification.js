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

async function debugCancelNotification() {
    console.log('🔍 調查取消請假通知問題\n');
    
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

        // 1. 檢查獻的最新請假記錄
        console.log('1️⃣ 檢查獻的請假記錄:');
        const xianLeaves = await LeaveRecord.find({ name: '獻' }).sort({ createdAt: -1 });
        console.log(`獻總共有 ${xianLeaves.length} 筆請假記錄:`);
        xianLeaves.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.team}班`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 2. 檢查鈞的註冊狀態
        console.log('2️⃣ 檢查鈞的註冊狀態:');
        const junProfile = await UserProfile.findOne({ memberName: '鈞' });
        if (junProfile) {
            console.log('✅ 鈞已註冊:');
            console.log(`   - LINE User ID: ${junProfile.lineUserId}`);
            console.log(`   - 班級: ${junProfile.team}`);
            console.log(`   - 通知啟用: ${junProfile.notificationEnabled}`);
        } else {
            console.log('❌ 鈞未註冊');
        }
        console.log('');

        // 3. 測試取消通知邏輯
        console.log('3️⃣ 測試取消通知邏輯:');
        
        if (xianLeaves.length > 0) {
            const latestLeave = xianLeaves[0];
            console.log(`測試取消 ${latestLeave.name} 在 ${latestLeave.date} 的請假記錄`);
            
            // 檢查是否有加班需求
            if (latestLeave.fullDayOvertime || latestLeave.customOvertime) {
                console.log('✅ 有加班需求，應該會發送取消通知');
                console.log(`   全天加班: ${latestLeave.fullDayOvertime ? JSON.stringify(latestLeave.fullDayOvertime) : '無'}`);
                console.log(`   自定義加班: ${latestLeave.customOvertime ? JSON.stringify(latestLeave.customOvertime) : '無'}`);
            } else {
                console.log('❌ 沒有加班需求，不會發送取消通知');
            }
            
            // 模擬調用取消通知API
            console.log('\n   模擬調用取消通知API...');
            try {
                const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/overtime-opportunity`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        date: latestLeave.date,
                        requesterName: latestLeave.name,
                        requesterTeam: latestLeave.team,
                        reason: '測試取消通知'
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('   ✅ 取消通知API調用成功');
                    console.log(`   結果: ${JSON.stringify(result)}`);
                } else {
                    const error = await response.text();
                    console.log(`   ❌ 取消通知API調用失敗: ${error}`);
                }
            } catch (error) {
                console.log(`   ❌ 取消通知API調用錯誤: ${error.message}`);
            }
        } else {
            console.log('❌ 沒有找到獻的請假記錄');
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

        // 5. 檢查環境變數
        console.log('5️⃣ 檢查環境變數:');
        console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`);
        console.log(`   LINE_CHANNEL_ACCESS_TOKEN: ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設定' : '❌ 未設定'}`);
        console.log(`   LINE_CHANNEL_SECRET: ${process.env.LINE_CHANNEL_SECRET ? '已設定' : '❌ 未設定'}`);

    } catch (error) {
        console.error('❌ 調查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行調查
debugCancelNotification().catch(console.error);
