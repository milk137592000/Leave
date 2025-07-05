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

async function testCancelNotification() {
    console.log('🧪 測試取消請假通知功能\n');
    
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

        // 1. 清理舊的測試數據
        console.log('1️⃣ 清理舊的測試數據...');
        await LeaveRecord.deleteMany({ 
            name: '測試獻',
            date: '2025-07-10'
        });
        console.log('   清理完成\n');

        // 2. 創建測試請假記錄（模擬獻請假）
        console.log('2️⃣ 創建測試請假記錄（模擬獻請假）...');
        
        const testLeaveRecord = new LeaveRecord({
            date: '2025-07-10',
            name: '測試獻',
            team: 'B',
            period: 'fullDay',
            confirmed: false,
            fullDayOvertime: {
                type: '加一半',
                firstHalfMember: undefined,
                secondHalfMember: undefined
            }
        });

        const savedRecord = await testLeaveRecord.save();
        console.log('   ✅ 測試請假記錄創建成功');
        console.log(`   記錄ID: ${savedRecord._id}`);
        console.log(`   全天加班設定: ${JSON.stringify(savedRecord.fullDayOvertime)}`);
        console.log('');

        // 3. 測試取消請假通知
        console.log('3️⃣ 測試取消請假通知...');
        
        try {
            const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/leave`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: '2025-07-10',
                    name: '測試獻',
                    cancelledByName: '測試獻',
                    cancelledByDisplayName: '測試獻',
                    reason: '測試取消通知'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('   ✅ 取消請假API調用成功');
                console.log(`   結果: ${result.message}`);
                console.log('   ✅ 應該已發送取消通知給所有符合條件的人員（除了測試獻本人）');
            } else {
                const error = await response.text();
                console.log(`   ❌ 取消請假API調用失敗: ${error}`);
            }
        } catch (error) {
            console.log(`   ❌ 取消請假API調用錯誤: ${error.message}`);
        }
        console.log('');

        // 4. 驗證記錄是否已刪除
        console.log('4️⃣ 驗證記錄是否已刪除...');
        const deletedRecord = await LeaveRecord.findOne({ 
            date: '2025-07-10',
            name: '測試獻'
        });
        
        if (!deletedRecord) {
            console.log('   ✅ 請假記錄已成功刪除');
        } else {
            console.log('   ❌ 請假記錄仍然存在');
        }
        console.log('');

        // 5. 測試直接調用通知函數
        console.log('5️⃣ 測試直接調用通知函數...');
        
        try {
            // 重新創建記錄用於測試
            const testRecord2 = new LeaveRecord({
                date: '2025-07-11',
                name: '測試獻2',
                team: 'B',
                period: 'fullDay',
                confirmed: false,
                fullDayOvertime: {
                    type: '加一半',
                    firstHalfMember: undefined,
                    secondHalfMember: undefined
                }
            });
            await testRecord2.save();

            // 動態導入通知函數
            const { sendOvertimeCancelledNotificationExcluding } = await import('./src/services/lineBot.js');
            
            const result = await sendOvertimeCancelledNotificationExcluding(
                {
                    date: '2025-07-11',
                    requesterName: '測試獻2',
                    requesterTeam: 'B',
                    reason: '直接測試取消通知'
                },
                ['測試獻2'] // 排除請假者本人
            );

            console.log('   ✅ 直接調用通知函數成功');
            console.log(`   成功發送: ${result.success} 人`);
            console.log(`   發送失敗: ${result.failed} 人`);
            console.log(`   排除人數: ${result.excluded} 人`);

            // 清理測試記錄
            await LeaveRecord.deleteOne({ 
                date: '2025-07-11',
                name: '測試獻2'
            });

        } catch (error) {
            console.log(`   ❌ 直接調用通知函數失敗: ${error.message}`);
        }
        console.log('');

        // 6. 檢查鈞的註冊狀態
        console.log('6️⃣ 檢查鈞的註冊狀態:');
        const junProfile = await UserProfile.findOne({ memberName: '鈞' });
        if (junProfile) {
            console.log('   ✅ 鈞已註冊，應該會收到通知');
            console.log(`   LINE User ID: ${junProfile.lineUserId}`);
            console.log(`   通知啟用: ${junProfile.notificationEnabled}`);
        } else {
            console.log('   ❌ 鈞未註冊，不會收到通知');
        }

        console.log('\n🎉 測試完成！');
        console.log('\n📋 問題分析:');
        console.log('如果鈞沒有收到取消通知，可能的原因：');
        console.log('1. 獻的請假記錄沒有設定加班需求');
        console.log('2. 取消請假時沒有調用正確的通知函數');
        console.log('3. LINE Bot 配置問題');
        console.log('4. 鈞的 LINE 用戶ID 不正確');

    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行測試
testCancelNotification().catch(console.error);
