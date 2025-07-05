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

async function debugWeiLeave0706() {
    console.log('🔍 徹底調查瑋0706請假問題\n');
    
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

        // 1. 檢查瑋的請假記錄
        console.log('1️⃣ 檢查瑋的請假記錄:');
        const weiRecords = await LeaveRecord.find({ 
            name: { $regex: '瑋', $options: 'i' }
        }).sort({ createdAt: -1 });
        
        console.log(`找到 ${weiRecords.length} 筆包含"瑋"的記錄:`);
        weiRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date} - ${record.name} (${record.team}班)`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 2. 檢查0706的所有請假記錄
        console.log('2️⃣ 檢查0706的所有請假記錄:');
        const date0706Records = await LeaveRecord.find({ date: '2025-07-06' });
        
        console.log(`2025-07-06 有 ${date0706Records.length} 筆請假記錄:`);
        date0706Records.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.name} (${record.team}班)`);
            console.log(`      時段: ${JSON.stringify(record.period)}`);
            console.log(`      全天加班: ${record.fullDayOvertime ? JSON.stringify(record.fullDayOvertime) : '無'}`);
            console.log(`      創建時間: ${record.createdAt}`);
            console.log('');
        });

        // 3. 檢查鈞的註冊狀態
        console.log('3️⃣ 檢查鈞的註冊狀態:');
        const junProfile = await UserProfile.findOne({ memberName: '鈞' });
        if (junProfile) {
            console.log('✅ 鈞已註冊:');
            console.log(`   - LINE User ID: ${junProfile.lineUserId}`);
            console.log(`   - 班級: ${junProfile.team}`);
            console.log(`   - 角色: ${junProfile.role}`);
            console.log(`   - 通知啟用: ${junProfile.notificationEnabled}`);
        } else {
            console.log('❌ 鈞未註冊');
        }
        console.log('');

        // 4. 模擬瑋請假並測試通知
        console.log('4️⃣ 模擬瑋請假並測試通知:');
        
        // 清理舊的測試記錄
        await LeaveRecord.deleteMany({ name: '測試瑋0706' });
        
        console.log('   創建瑋的測試請假記錄...');
        const testRecord = new LeaveRecord({
            date: '2025-07-06',
            name: '測試瑋0706',
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
        
        // 5. 測試通知邏輯
        console.log('5️⃣ 測試通知邏輯:');
        
        if (junProfile) {
            // 計算班別輪值
            const SHIFT_CYCLE = ['大休', '早班', '早班', '中班', '中班', '小休', '夜班', '夜班'];
            const TEAM_START_POSITIONS = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
            
            const targetDate = new Date('2025-07-06');
            const startDate = new Date('2025-04-01');
            const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            const junCyclePosition = (TEAM_START_POSITIONS[junProfile.team] + daysDiff) % 8;
            const junShift = SHIFT_CYCLE[junCyclePosition];
            
            console.log(`   鈞的班級 ${junProfile.team} 在2025-07-06的輪值: ${junShift}`);
            
            // 檢查是否符合通知條件
            const eligible = junProfile.memberName !== '測試瑋0706' && // 不是同一人
                           junProfile.team !== 'B' && // 不是同班
                           (junShift === '大休' || junShift === '小休' || 
                            junProfile.role === '班長' || 
                            ['中班', '夜班', '早班'].includes(junShift));
            
            console.log(`   鈞是否符合通知條件: ${eligible ? '是' : '否'}`);
            if (eligible) {
                console.log(`   通知理由: 您的${junProfile.team}班當天${junShift}，可協助B班加班`);
            }
        }
        
        // 6. 測試實際發送通知
        console.log('6️⃣ 測試實際發送通知:');
        
        if (junProfile && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            try {
                const testMessage = {
                    type: 'text',
                    text: `🧪 瑋請假通知測試\n\n📅 日期：2025-07-06\n👤 請假人員：B班 瑋\n⏰ 時段：全天\n\n您的C班當天中班，可協助B班加班。\n\n測試時間: ${new Date().toLocaleString('zh-TW')}`
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
                    console.log('   ✅ 測試通知發送成功');
                    console.log('   請檢查鈞是否收到測試通知');
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ 測試通知發送失敗: ${response.status}`);
                    console.log(`   錯誤詳情: ${errorText}`);
                }
            } catch (error) {
                console.log(`   ❌ 測試通知發送錯誤: ${error.message}`);
            }
        } else {
            console.log('   ❌ 無法測試發送通知（鈞未註冊或TOKEN未設定）');
        }
        
        // 7. 檢查系統日誌
        console.log('7️⃣ 系統分析:');
        
        const hasWeiRecord0706 = date0706Records.some(r => r.name.includes('瑋'));
        const hasOvertimeRequirement = date0706Records.some(r => r.fullDayOvertime);
        
        console.log(`   瑋在0706有請假記錄: ${hasWeiRecord0706 ? '是' : '否'}`);
        console.log(`   請假記錄有加班需求: ${hasOvertimeRequirement ? '是' : '否'}`);
        console.log(`   鈞已註冊: ${junProfile ? '是' : '否'}`);
        console.log(`   LINE Bot配置: ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '正常' : '異常'}`);
        
        // 清理測試記錄
        await LeaveRecord.deleteOne({ _id: savedRecord._id });
        console.log('   ✅ 測試記錄已清理');
        
        console.log('\n🎯 問題分析結論:');
        
        if (!hasWeiRecord0706) {
            console.log('❌ 主要問題: 瑋在0706沒有請假記錄');
            console.log('   可能原因: 請假申請沒有成功提交或被刪除');
        } else if (!hasOvertimeRequirement) {
            console.log('❌ 主要問題: 請假記錄沒有加班需求設定');
            console.log('   可能原因: 自動加班設定邏輯沒有生效');
        } else if (!junProfile) {
            console.log('❌ 主要問題: 鈞沒有註冊');
            console.log('   可能原因: 鈞沒有完成LINE Bot註冊流程');
        } else {
            console.log('✅ 數據看起來正常，問題可能在通知觸發邏輯');
            console.log('   建議: 檢查請假創建時是否正確調用通知函數');
        }

    } catch (error) {
        console.error('❌ 調查失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行調查
debugWeiLeave0706().catch(console.error);
