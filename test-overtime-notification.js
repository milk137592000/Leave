const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 模擬加班資格檢查邏輯
function checkOvertimeEligibility(memberName, memberTeam, memberRole, requesterName, requesterTeam, memberShift) {
    // 不能為自己加班
    if (memberName === requesterName) {
        return { eligible: false };
    }
    
    // 不能為同班同事加班
    if (memberTeam === requesterTeam) {
        return { eligible: false };
    }
    
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

async function testOvertimeNotification() {
    console.log('🧪 測試修改後的加班通知邏輯\n');
    
    // 測試場景：2025-07-06 瑋(B班)請假
    const testDate = '2025-07-06';
    const requesterName = '瑋';
    const requesterTeam = 'B';
    
    console.log(`📅 測試日期: ${testDate}`);
    console.log(`👤 請假人員: ${requesterTeam}班 ${requesterName}\n`);
    
    // 計算各班別當天輪值
    console.log('🔄 各班別當天輪值:');
    const teams = ['A', 'B', 'C', 'D'];
    const shifts = {};
    teams.forEach(team => {
        shifts[team] = getShiftForDate(testDate, team);
        console.log(`   ${team}班: ${shifts[team]}`);
    });
    console.log('');
    
    // 測試所有可能的成員
    const testMembers = [
        { name: '小雞', team: 'A', role: '班長' },
        { name: '竣', team: 'A', role: '班長' },
        { name: '耀', team: 'A', role: '班員' },
        { name: '隆', team: 'B', role: '班長' },
        { name: '廷', team: 'B', role: '班長' },
        { name: '惟', team: 'B', role: '班員' },
        { name: '瑋', team: 'B', role: '班員' }, // 請假者
        { name: '誠', team: 'C', role: '班長' },
        { name: '銘', team: 'C', role: '班長' },
        { name: '鈞', team: 'C', role: '班員' }, // 重點測試對象
        { name: '永', team: 'D', role: '班長' },
        { name: '元', team: 'D', role: '班長' },
        { name: '良', team: 'D', role: '班員' }
    ];
    
    console.log('📋 加班資格檢查結果:');
    console.log('');
    
    let eligibleCount = 0;
    const eligibleMembers = [];
    
    testMembers.forEach(member => {
        const memberShift = shifts[member.team];
        const eligibility = checkOvertimeEligibility(
            member.name,
            member.team,
            member.role,
            requesterName,
            requesterTeam,
            memberShift
        );
        
        const status = eligibility.eligible ? '✅' : '❌';
        console.log(`${status} ${member.team}班 ${member.name} (${member.role}) - ${memberShift}`);
        
        if (eligibility.eligible) {
            console.log(`   理由: ${eligibility.reason}`);
            eligibleCount++;
            eligibleMembers.push(member);
        }
        console.log('');
    });
    
    console.log(`📊 總結:`);
    console.log(`   符合資格人數: ${eligibleCount} 人`);
    console.log(`   符合資格成員: ${eligibleMembers.map(m => `${m.team}班${m.name}`).join(', ')}`);
    
    // 重點檢查鈞的情況
    const junEligibility = checkOvertimeEligibility('鈞', 'C', '班員', '瑋', 'B', shifts['C']);
    console.log(`\n🎯 重點檢查 - 鈞的加班資格:`);
    console.log(`   班級: C班 (${shifts['C']})`);
    console.log(`   角色: 班員`);
    console.log(`   符合資格: ${junEligibility.eligible ? '是' : '否'}`);
    if (junEligibility.eligible) {
        console.log(`   通知理由: ${junEligibility.reason}`);
        console.log('   ✅ 修改後鈞應該會收到通知！');
    } else {
        console.log('   ❌ 鈞仍然不會收到通知');
    }
}

// 執行測試
testOvertimeNotification().catch(console.error);
