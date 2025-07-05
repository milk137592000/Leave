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

const LineUserStateSchema = new mongoose.Schema({
    lineUserId: { type: String, required: true, unique: true },
    step: { type: String, required: true },
    selectedName: { type: String },
    selectedTeam: { type: String },
    lastActivity: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

async function completeNotificationDiagnosis() {
    console.log('🔍 完整通知系統診斷 - 徹底檢查LINE與app的關係\n');
    
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
        const LineUserState = mongoose.models.LineUserState || mongoose.model('LineUserState', LineUserStateSchema);

        console.log('🎯 診斷目標: 找出0706獻請假時鈞沒收到通知的原因\n');

        // 1. 檢查環境變數配置
        console.log('1️⃣ 環境變數配置檢查:');
        const requiredEnvs = [
            'MONGODB_URI',
            'LINE_CHANNEL_ACCESS_TOKEN', 
            'LINE_CHANNEL_SECRET',
            'NEXTAUTH_URL'
        ];
        
        let envOk = true;
        requiredEnvs.forEach(env => {
            const value = process.env[env];
            if (value) {
                console.log(`   ✅ ${env}: ${env.includes('TOKEN') || env.includes('SECRET') ? '已設定' : value}`);
            } else {
                console.log(`   ❌ ${env}: 未設定`);
                envOk = false;
            }
        });
        
        if (!envOk) {
            console.log('   ⚠️  環境變數配置不完整，可能影響通知功能');
        }
        console.log('');

        // 2. 檢查數據庫中的用戶資料
        console.log('2️⃣ 用戶資料檢查:');
        
        // 檢查UserProfile中的用戶
        const userProfiles = await UserProfile.find({});
        console.log(`   UserProfile 註冊用戶: ${userProfiles.length} 人`);
        userProfiles.forEach(user => {
            console.log(`     - ${user.team}班 ${user.memberName} (${user.role})`);
            console.log(`       LINE ID: ${user.lineUserId}`);
            console.log(`       通知啟用: ${user.notificationEnabled}`);
            console.log(`       註冊時間: ${user.createdAt}`);
        });
        
        // 檢查LineUserState中的用戶
        const lineUsers = await LineUserState.find({ step: 'name_selected' });
        console.log(`\n   LineUserState 註冊用戶: ${lineUsers.length} 人`);
        lineUsers.forEach(user => {
            console.log(`     - ${user.selectedTeam}班 ${user.selectedName}`);
            console.log(`       LINE ID: ${user.lineUserId}`);
            console.log(`       最後活動: ${user.lastActivity}`);
        });
        
        // 特別檢查鈞的註冊狀態
        const junProfile = userProfiles.find(u => u.memberName === '鈞');
        const junLineState = lineUsers.find(u => u.selectedName === '鈞');
        
        console.log(`\n   🎯 鈞的註冊狀態:`);
        if (junProfile) {
            console.log(`     ✅ UserProfile: ${junProfile.team}班 ${junProfile.role}`);
            console.log(`     LINE ID: ${junProfile.lineUserId}`);
            console.log(`     通知啟用: ${junProfile.notificationEnabled}`);
        } else {
            console.log(`     ❌ UserProfile: 未註冊`);
        }
        
        if (junLineState) {
            console.log(`     ✅ LineUserState: ${junLineState.selectedTeam}班`);
            console.log(`     LINE ID: ${junLineState.lineUserId}`);
        } else {
            console.log(`     ❌ LineUserState: 未註冊`);
        }
        console.log('');

        // 3. 檢查0706的請假記錄
        console.log('3️⃣ 0706請假記錄檢查:');
        const date0706Records = await LeaveRecord.find({ date: '2025-07-06' });
        
        if (date0706Records.length === 0) {
            console.log('   ❌ 沒有找到2025-07-06的任何請假記錄');
            console.log('   這可能是問題的根源！');
        } else {
            console.log(`   找到 ${date0706Records.length} 筆2025-07-06的請假記錄:`);
            date0706Records.forEach((record, index) => {
                console.log(`     ${index + 1}. ${record.name} (${record.team}班)`);
                console.log(`        時段: ${JSON.stringify(record.period)}`);
                console.log(`        全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
                console.log(`        創建時間: ${record.createdAt}`);
            });
        }
        
        // 檢查所有包含"獻"的記錄
        const xianRecords = await LeaveRecord.find({ 
            name: { $regex: '獻', $options: 'i' }
        }).sort({ createdAt: -1 });
        
        console.log(`\n   包含"獻"的所有請假記錄: ${xianRecords.length} 筆`);
        xianRecords.forEach((record, index) => {
            console.log(`     ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`        全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`        創建時間: ${record.createdAt}`);
        });
        console.log('');

        // 4. 測試LINE Bot連接
        console.log('4️⃣ LINE Bot連接測試:');
        
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            try {
                // 測試LINE Bot API
                const response = await fetch('https://api.line.me/v2/bot/info', {
                    headers: {
                        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
                    }
                });
                
                if (response.ok) {
                    const botInfo = await response.json();
                    console.log('   ✅ LINE Bot API連接成功');
                    console.log(`   Bot名稱: ${botInfo.displayName}`);
                    console.log(`   Bot ID: ${botInfo.userId}`);
                } else {
                    console.log(`   ❌ LINE Bot API連接失敗: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`   ❌ LINE Bot API測試錯誤: ${error.message}`);
            }
        } else {
            console.log('   ❌ LINE_CHANNEL_ACCESS_TOKEN 未設定');
        }
        console.log('');

        // 5. 測試發送消息給鈞
        console.log('5️⃣ 測試發送消息給鈞:');
        
        if (junProfile && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            try {
                const testMessage = {
                    type: 'text',
                    text: `🧪 系統診斷測試消息\n\n時間: ${new Date().toLocaleString('zh-TW')}\n\n如果您收到這條消息，說明LINE通知功能正常。`
                };
                
                const response = await fetch('https://api.line.me/v2/bot/message/push', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: junProfile.lineUserId,
                        messages: [testMessage]
                    })
                });
                
                if (response.ok) {
                    console.log('   ✅ 測試消息發送成功');
                    console.log(`   目標: ${junProfile.memberName} (${junProfile.lineUserId})`);
                    console.log('   請檢查鈞是否收到測試消息');
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ 測試消息發送失敗: ${response.status}`);
                    console.log(`   錯誤詳情: ${errorText}`);
                }
            } catch (error) {
                console.log(`   ❌ 測試消息發送錯誤: ${error.message}`);
            }
        } else {
            console.log('   ❌ 無法測試發送消息（鈞未註冊或TOKEN未設定）');
        }
        console.log('');

        // 6. 創建完整的請假測試
        console.log('6️⃣ 完整請假流程測試:');
        
        // 清理舊的測試記錄
        await LeaveRecord.deleteMany({ name: '診斷測試獻' });
        
        console.log('   創建測試請假記錄...');
        const testRecord = new LeaveRecord({
            date: '2025-07-20',
            name: '診斷測試獻',
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
        console.log(`   ✅ 測試記錄創建成功: ${savedRecord._id}`);
        
        // 模擬通知邏輯
        console.log('   測試通知邏輯...');
        
        if (savedRecord.fullDayOvertime) {
            console.log('   ✅ 有加班需求，應該觸發通知');
            
            // 檢查鈞是否符合通知條件
            if (junProfile) {
                // 計算班別輪值
                const SHIFT_CYCLE = ['大休', '早班', '早班', '中班', '中班', '小休', '夜班', '夜班'];
                const TEAM_START_POSITIONS = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
                
                const targetDate = new Date('2025-07-20');
                const startDate = new Date('2025-04-01');
                const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                
                const junCyclePosition = (TEAM_START_POSITIONS[junProfile.team] + daysDiff) % 8;
                const junShift = SHIFT_CYCLE[junCyclePosition];
                
                console.log(`   鈞的班級 ${junProfile.team} 在2025-07-20的輪值: ${junShift}`);
                
                // 檢查是否符合通知條件
                const eligible = junProfile.team !== 'B' && // 不是同班
                               (junShift === '大休' || junShift === '小休' || 
                                junProfile.role === '班長' || 
                                ['中班', '夜班', '早班'].includes(junShift));
                
                if (eligible) {
                    console.log('   ✅ 鈞符合通知條件');
                } else {
                    console.log('   ❌ 鈞不符合通知條件');
                }
            }
        } else {
            console.log('   ❌ 沒有加班需求，不會觸發通知');
        }
        
        // 清理測試記錄
        await LeaveRecord.deleteOne({ _id: savedRecord._id });
        console.log('   ✅ 測試記錄已清理');
        console.log('');

        // 7. 診斷結論
        console.log('🎯 診斷結論:');
        console.log('');
        
        if (date0706Records.length === 0) {
            console.log('❌ 主要問題: 2025-07-06沒有任何請假記錄');
            console.log('   可能原因:');
            console.log('   1. 獻沒有真正提交請假申請');
            console.log('   2. 請假申請提交失敗但沒有錯誤提示');
            console.log('   3. 請假記錄被意外刪除');
            console.log('   4. 日期格式或時區問題');
        }
        
        if (!junProfile) {
            console.log('❌ 次要問題: 鈞沒有在UserProfile中註冊');
            console.log('   即使有請假記錄，鈞也不會收到通知');
        }
        
        console.log('\n📋 建議檢查步驟:');
        console.log('1. 確認獻是否真的在系統中提交了0706的請假申請');
        console.log('2. 檢查前端請假提交是否有錯誤');
        console.log('3. 檢查後端API是否正確處理請假申請');
        console.log('4. 確認鈞是否完成了LINE Bot註冊流程');
        console.log('5. 測試LINE Bot是否能正常發送消息給鈞');

    } catch (error) {
        console.error('❌ 診斷失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行完整診斷
completeNotificationDiagnosis().catch(console.error);
