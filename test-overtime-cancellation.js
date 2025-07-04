/**
 * 測試加班事實消失通知功能
 * 驗證當加班事實消失時，系統會通知原本可以加班的人，但不通知導致加班事實消失的人（X）
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testOvertimeCancellationNotification() {
    console.log('🧪 開始測試加班事實消失通知功能...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
        // 測試場景1：請假記錄被刪除
        console.log('📋 測試場景1：請假記錄被刪除');
        console.log('預期：通知所有原本可以加班的人，但不通知原請假人\n');

        const deleteTestData = {
            date: '2025-01-10',
            requesterName: '張三',
            requesterTeam: 'A',
            reason: '請假記錄已刪除',
            excludeNames: ['張三'] // 排除原請假人
        };

        const deleteResponse = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteTestData)
        });

        if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log('✅ 請假記錄刪除通知測試成功:', {
                成功通知: deleteResult.notified,
                失敗: deleteResult.failed,
                排除人數: deleteResult.excluded,
                排除人員: deleteResult.excludedNames
            });
        } else {
            console.error('❌ 請假記錄刪除通知測試失敗:', await deleteResponse.text());
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 測試場景2：加班需求被取消
        console.log('📋 測試場景2：加班需求被取消');
        console.log('預期：通知所有原本可以加班的人，但不通知取消加班的人\n');

        const cancelTestData = {
            date: '2025-01-11',
            requesterName: '李四',
            requesterTeam: 'B',
            reason: '加班需求已取消',
            excludeNames: ['李四'] // 排除取消加班的人
        };

        const cancelResponse = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cancelTestData)
        });

        if (cancelResponse.ok) {
            const cancelResult = await cancelResponse.json();
            console.log('✅ 加班取消通知測試成功:', {
                成功通知: cancelResult.notified,
                失敗: cancelResult.failed,
                排除人數: cancelResult.excluded,
                排除人員: cancelResult.excludedNames
            });
        } else {
            console.error('❌ 加班取消通知測試失敗:', await cancelResponse.text());
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 測試場景3：有人確認加班
        console.log('📋 測試場景3：有人確認加班');
        console.log('預期：通知所有原本可以加班的人，但不通知確認加班的人\n');

        const confirmTestData = {
            date: '2025-01-12',
            requesterName: '王五',
            requesterTeam: 'C',
            reason: '陳六 已確認加班，此機會已不再開放',
            excludeNames: ['陳六'] // 排除確認加班的人
        };

        const confirmResponse = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(confirmTestData)
        });

        if (confirmResponse.ok) {
            const confirmResult = await confirmResponse.json();
            console.log('✅ 加班確認通知測試成功:', {
                成功通知: confirmResult.notified,
                失敗: confirmResult.failed,
                排除人數: confirmResult.excluded,
                排除人員: confirmResult.excludedNames
            });
        } else {
            console.error('❌ 加班確認通知測試失敗:', await confirmResponse.text());
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 測試場景4：多人排除
        console.log('📋 測試場景4：多人排除測試');
        console.log('預期：通知所有原本可以加班的人，但不通知多個指定的人\n');

        const multiExcludeTestData = {
            date: '2025-01-13',
            requesterName: '趙七',
            requesterTeam: 'D',
            reason: '多人排除測試',
            excludeNames: ['趙七', '錢八', '孫九'] // 排除多個人
        };

        const multiExcludeResponse = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(multiExcludeTestData)
        });

        if (multiExcludeResponse.ok) {
            const multiExcludeResult = await multiExcludeResponse.json();
            console.log('✅ 多人排除通知測試成功:', {
                成功通知: multiExcludeResult.notified,
                失敗: multiExcludeResult.failed,
                排除人數: multiExcludeResult.excluded,
                排除人員: multiExcludeResult.excludedNames
            });
        } else {
            console.error('❌ 多人排除通知測試失敗:', await multiExcludeResponse.text());
        }

        console.log('\n🎉 所有測試完成！');

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    }
}

// 執行測試
if (require.main === module) {
    testOvertimeCancellationNotification();
}

module.exports = { testOvertimeCancellationNotification };
