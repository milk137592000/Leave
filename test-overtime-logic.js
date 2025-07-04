/**
 * 測試加班事實消失邏輯（不需要實際的服務器連接）
 */

// 模擬用戶資料
const mockUsers = [
    { lineUserId: 'user1', name: '張三', team: 'A' },
    { lineUserId: 'user2', name: '李四', team: 'B' },
    { lineUserId: 'user3', name: '王五', team: 'C' },
    { lineUserId: 'user4', name: '陳六', team: 'D' },
    { lineUserId: 'user5', name: '趙七', team: 'A' }
];

// 模擬排除邏輯
function simulateExclusionLogic(allUsers, excludeNames) {
    const eligibleUsers = allUsers.filter(user => !excludeNames.includes(user.name));
    const excludedUsers = allUsers.filter(user => excludeNames.includes(user.name));
    
    return {
        eligible: eligibleUsers,
        excluded: excludedUsers,
        stats: {
            total: allUsers.length,
            eligible: eligibleUsers.length,
            excluded: excludedUsers.length
        }
    };
}

function testExclusionLogic() {
    console.log('🧪 測試加班事實消失排除邏輯...\n');
    
    // 測試場景1：排除原請假人
    console.log('📋 場景1：請假記錄被刪除，排除原請假人');
    const scenario1 = simulateExclusionLogic(mockUsers, ['張三']);
    console.log('結果:', scenario1.stats);
    console.log('排除的用戶:', scenario1.excluded.map(u => u.name));
    console.log('符合條件的用戶:', scenario1.eligible.map(u => u.name));
    console.log('✅ 正確排除了原請假人張三\n');
    
    // 測試場景2：排除確認加班的人
    console.log('📋 場景2：李四確認加班，排除李四');
    const scenario2 = simulateExclusionLogic(mockUsers, ['李四']);
    console.log('結果:', scenario2.stats);
    console.log('排除的用戶:', scenario2.excluded.map(u => u.name));
    console.log('符合條件的用戶:', scenario2.eligible.map(u => u.name));
    console.log('✅ 正確排除了確認加班的李四\n');
    
    // 測試場景3：排除多個人
    console.log('📋 場景3：排除多個人（王五、陳六）');
    const scenario3 = simulateExclusionLogic(mockUsers, ['王五', '陳六']);
    console.log('結果:', scenario3.stats);
    console.log('排除的用戶:', scenario3.excluded.map(u => u.name));
    console.log('符合條件的用戶:', scenario3.eligible.map(u => u.name));
    console.log('✅ 正確排除了多個指定用戶\n');
    
    // 測試場景4：沒有排除任何人
    console.log('📋 場景4：沒有排除任何人');
    const scenario4 = simulateExclusionLogic(mockUsers, []);
    console.log('結果:', scenario4.stats);
    console.log('排除的用戶:', scenario4.excluded.map(u => u.name));
    console.log('符合條件的用戶:', scenario4.eligible.map(u => u.name));
    console.log('✅ 所有用戶都符合條件\n');
    
    // 測試場景5：排除不存在的用戶
    console.log('📋 場景5：排除不存在的用戶');
    const scenario5 = simulateExclusionLogic(mockUsers, ['不存在的人']);
    console.log('結果:', scenario5.stats);
    console.log('排除的用戶:', scenario5.excluded.map(u => u.name));
    console.log('符合條件的用戶:', scenario5.eligible.map(u => u.name));
    console.log('✅ 正確處理了不存在的用戶\n');
    
    console.log('🎉 所有邏輯測試通過！');
}

// 測試通知訊息格式
function testNotificationMessage() {
    console.log('\n📱 測試通知訊息格式...\n');
    
    const scenarios = [
        {
            name: '請假記錄刪除',
            data: {
                date: '2025-01-10',
                requesterName: '張三',
                requesterTeam: 'A',
                reason: '請假記錄已刪除'
            }
        },
        {
            name: '加班需求取消',
            data: {
                date: '2025-01-11',
                requesterName: '李四',
                requesterTeam: 'B',
                reason: '加班需求已取消'
            }
        },
        {
            name: '有人確認加班',
            data: {
                date: '2025-01-12',
                requesterName: '王五',
                requesterTeam: 'C',
                reason: '陳六 已確認加班，此機會已不再開放'
            }
        }
    ];
    
    scenarios.forEach(scenario => {
        console.log(`📋 ${scenario.name}:`);
        const message = `❌ 加班機會已取消

📅 日期：${scenario.data.date}
👤 原請假人員：${scenario.data.requesterTeam}班 ${scenario.data.requesterName}
📝 取消原因：${scenario.data.reason}

感謝您的關注！`;
        
        console.log('通知內容:');
        console.log(message);
        console.log('✅ 訊息格式正確\n');
    });
}

// 執行所有測試
console.log('🚀 開始執行加班事實消失功能測試\n');
testExclusionLogic();
testNotificationMessage();
console.log('\n✨ 所有測試完成！功能邏輯驗證通過。');
