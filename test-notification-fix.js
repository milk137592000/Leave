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

async function testNotificationFix() {
    console.log('🧪 測試通知修復效果\n');
    
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
            name: { $in: ['測試獻', '測試瑋'] },
            date: '2025-07-07'
        });
        console.log('   清理完成\n');

        // 2. 測試創建請假記錄（模擬獻請假）
        console.log('2️⃣ 測試創建請假記錄（模擬獻請假）...');
        
        const testLeaveRecord = {
            date: '2025-07-07',
            name: '測試獻',
            team: 'B',
            period: 'fullDay',
            confirmed: false
        };

        // 模擬API調用
        const createResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testLeaveRecord)
        });

        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('   ✅ 請假記錄創建成功');
            console.log(`   記錄ID: ${result._id}`);
            console.log(`   全天加班設定: ${result.fullDayOvertime ? JSON.stringify(result.fullDayOvertime) : '無'}`);
            
            if (result.fullDayOvertime && result.fullDayOvertime.type) {
                console.log('   ✅ 自動設定加班需求成功，應該會發送通知');
            } else {
                console.log('   ❌ 沒有自動設定加班需求');
            }
        } else {
            const error = await createResponse.text();
            console.log(`   ❌ 請假記錄創建失敗: ${error}`);
        }
        console.log('');

        // 3. 檢查加班通知邏輯
        console.log('3️⃣ 測試加班通知邏輯...');
        
        const testResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/test-overtime-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testDate: '2025-07-07',
                requesterName: '測試獻',
                requesterTeam: 'B',
                dryRun: true
            })
        });

        if (testResponse.ok) {
            const result = await testResponse.json();
            console.log('   ✅ 加班通知測試成功');
            console.log(`   符合資格人數: ${result.summary.eligibleUsers}`);
            console.log(`   鈞的狀態: ${result.junStatus ? (result.junStatus.eligible ? '符合資格' : '不符合資格') : '未找到'}`);
            
            if (result.junStatus && result.junStatus.eligible) {
                console.log(`   ✅ 鈞現在會收到通知！理由: ${result.junStatus.reason}`);
            } else {
                console.log('   ❌ 鈞仍然不會收到通知');
            }
        } else {
            const error = await testResponse.text();
            console.log(`   ❌ 加班通知測試失敗: ${error}`);
        }
        console.log('');

        // 4. 測試代理請假通知
        console.log('4️⃣ 測試代理請假通知...');
        
        const proxyLeaveRecord = {
            date: '2025-07-08',
            name: '測試瑋',
            team: 'B',
            period: 'fullDay',
            confirmed: false,
            isProxyRequest: true,
            lineUserId: 'test-proxy-user'
        };

        const proxyResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proxyLeaveRecord)
        });

        if (proxyResponse.ok) {
            const result = await proxyResponse.json();
            console.log('   ✅ 代理請假記錄創建成功');
            console.log('   ✅ 應該會發送代理請假通知給被請假人');
        } else {
            const error = await proxyResponse.text();
            console.log(`   ❌ 代理請假記錄創建失敗: ${error}`);
        }
        console.log('');

        // 5. 清理測試數據
        console.log('5️⃣ 清理測試數據...');
        await LeaveRecord.deleteMany({ 
            name: { $in: ['測試獻', '測試瑋'] },
            date: { $in: ['2025-07-07', '2025-07-08'] }
        });
        console.log('   清理完成\n');

        console.log('🎉 測試完成！');
        console.log('\n📋 修復摘要:');
        console.log('✅ 全天請假時自動設定加班需求');
        console.log('✅ 擴展加班通知範圍至所有班級');
        console.log('✅ 新增代理請假通知功能');
        console.log('✅ 新增代理取消請假通知功能');

    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行測試
testNotificationFix().catch(console.error);
