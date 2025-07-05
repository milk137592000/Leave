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

// 計算班別輪值
function getShiftForDate(date, team) {
    const SHIFT_CYCLE = ['大休', '早班', '早班', '中班', '中班', '小休', '夜班', '夜班'];
    const TEAM_START_POSITIONS = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
    
    const targetDate = new Date(date);
    const startDate = new Date('2025-04-01');
    const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const cyclePosition = (TEAM_START_POSITIONS[team] + daysDiff) % 8;
    return SHIFT_CYCLE[cyclePosition];
}

// 修改後的加班資格檢查邏輯
function checkOvertimeEligibility(memberName, memberTeam, memberRole, requesterName, requesterTeam, date) {
    // 不能為自己加班
    if (memberName === requesterName) {
        return { eligible: false };
    }
    
    // 不能為同班同事加班
    if (memberTeam === requesterTeam) {
        return { eligible: false };
    }
    
    // 檢查該員工當天的班別
    const memberShift = getShiftForDate(date, memberTeam);
    
    // 大休班級優先有加班資格
    if (memberShift === '大休') {
        return {
            eligible: true,
            reason: `您的${memberTeam}班當天大休，可協助${requesterTeam}班加班`
        };
    }
    
    // 小休班級也可能有加班資格
    if (memberShift === '小休') {
        return {
            eligible: true,
            reason: `您的${memberTeam}班當天小休，可協助${requesterTeam}班加班`
        };
    }
    
    // 其他班別也可能有加班資格，但優先級較低
    // 中班、夜班、早班的員工也可以考慮加班，特別是班長
    if (memberRole === '班長') {
        return {
            eligible: true,
            reason: `您是${memberTeam}班班長，可協助${requesterTeam}班加班`
        };
    }
    
    // 一般班員也可以加班，但需要根據班別判斷
    if (memberShift === '中班' || memberShift === '夜班' || memberShift === '早班') {
        return {
            eligible: true,
            reason: `您的${memberTeam}班當天${memberShift}，可協助${requesterTeam}班加班`
        };
    }
    
    return { eligible: false };
}

async function verifyFix() {
    console.log('🔧 驗證加班通知修復結果\n');
    
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

        // 查找所有已註冊用戶
        const allUsers = await UserProfile.find({ notificationEnabled: true });
        console.log(`👥 找到 ${allUsers.length} 位已註冊用戶\n`);

        // 測試場景：2025-07-06 瑋(B班)請假
        const testDate = '2025-07-06';
        const requesterName = '瑋';
        const requesterTeam = 'B';
        
        console.log(`📅 測試場景: ${testDate} ${requesterTeam}班 ${requesterName} 請假\n`);
        
        // 檢查每個用戶的加班資格
        console.log('📋 加班資格檢查結果:');
        let eligibleCount = 0;
        const eligibleUsers = [];
        
        for (const user of allUsers) {
            const eligibility = checkOvertimeEligibility(
                user.memberName,
                user.team,
                user.role,
                requesterName,
                requesterTeam,
                testDate
            );
            
            const memberShift = getShiftForDate(testDate, user.team);
            const status = eligibility.eligible ? '✅' : '❌';
            
            console.log(`${status} ${user.team}班 ${user.memberName} (${user.role}) - ${memberShift}`);
            
            if (eligibility.eligible) {
                console.log(`   理由: ${eligibility.reason}`);
                eligibleCount++;
                eligibleUsers.push(user);
            }
            console.log('');
        }
        
        console.log(`📊 總結:`);
        console.log(`   符合資格人數: ${eligibleCount} 人`);
        console.log(`   符合資格成員: ${eligibleUsers.map(u => `${u.team}班${u.memberName}`).join(', ')}\n`);
        
        // 重點檢查鈞的情況
        const junUser = allUsers.find(u => u.memberName === '鈞');
        if (junUser) {
            const junEligibility = checkOvertimeEligibility(
                junUser.memberName,
                junUser.team,
                junUser.role,
                requesterName,
                requesterTeam,
                testDate
            );
            
            const junShift = getShiftForDate(testDate, junUser.team);
            
            console.log(`🎯 重點檢查 - 鈞的加班資格:`);
            console.log(`   班級: ${junUser.team}班 (${junShift})`);
            console.log(`   角色: ${junUser.role}`);
            console.log(`   符合資格: ${junEligibility.eligible ? '是' : '否'}`);
            
            if (junEligibility.eligible) {
                console.log(`   通知理由: ${junEligibility.reason}`);
                console.log('   ✅ 修復成功！鈞現在會收到通知！');
            } else {
                console.log('   ❌ 修復失敗，鈞仍然不會收到通知');
            }
        } else {
            console.log('❌ 未找到鈞的註冊資料');
        }
        
        console.log('\n🎉 驗證完成！');

    } catch (error) {
        console.error('❌ 驗證失敗:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔚 資料庫連接已關閉');
    }
}

// 執行驗證
verifyFix().catch(console.error);
