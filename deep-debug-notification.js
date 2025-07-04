/**
 * 深度診斷通知發送問題
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkJunNewStatus() {
    console.log('🔍 檢查鈞重新綁定後的狀態...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';

    try {
        const response = await fetch(`${baseUrl}/api/line-admin/users`);
        
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status}`);
        }
        
        const result = await response.json();
        const jun = result.users?.find(u => u.memberName === '鈞');
        
        if (jun) {
            console.log('✅ 鈞已重新註冊:');
            console.log(`   姓名: ${jun.memberName}`);
            console.log(`   班級: ${jun.team}班`);
            console.log(`   角色: ${jun.role}`);
            console.log(`   新 LINE ID: ${jun.lineUserId}`);
            console.log(`   通知啟用: ${jun.notificationEnabled ? '✅ 是' : '❌ 否'}`);
            console.log(`   重新註冊時間: ${new Date(jun.createdAt).toLocaleString()}\n`);
            return jun;
        } else {
            console.log('❌ 鈞尚未重新註冊\n');
            return null;
        }
    } catch (error) {
        console.error('❌ 檢查失敗:', error);
        return null;
    }
}

async function testDirectLineMessage(jun) {
    if (!jun) {
        console.log('❌ 無法測試：鈞未註冊\n');
        return;
    }

    console.log('📱 測試直接發送 LINE 訊息給鈞...\n');

    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        // 測試發送簡單訊息
        const testData = {
            lineUserId: jun.lineUserId,
            message: '🧪 測試訊息：這是直接發送給鈞的測試通知，如果收到請回覆「收到」'
        };

        console.log('發送測試訊息...');
        console.log(`目標 LINE ID: ${jun.lineUserId}`);
        
        const response = await fetch(`${baseUrl}/api/test-direct-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ 測試訊息發送成功:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ 測試訊息發送失敗:', errorText);
        }
    } catch (error) {
        console.error('❌ 測試直接訊息失敗:', error);
    }
}

async function testOvertimeCancellationWithLogs(jun) {
    if (!jun) {
        console.log('❌ 無法測試：鈞未註冊\n');
        return;
    }

    console.log('🧪 測試加班取消通知（帶詳細日誌）...\n');

    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';
        
        const testData = {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '深度測試：檢查鈞是否能收到加班取消通知',
            excludeNames: [] // 不排除任何人
        };

        console.log('發送加班取消通知...');
        console.log('測試參數:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(`${baseUrl}/api/overtime-opportunity`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log(`HTTP 狀態: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API 回應:', JSON.stringify(result, null, 2));
            
            if (result.notified > 0) {
                console.log('🎯 鈞應該會收到通知');
            } else if (result.failed > 0) {
                console.log('⚠️  通知發送失敗');
            } else {
                console.log('❓ 沒有找到符合條件的用戶');
            }
        } else {
            const errorText = await response.text();
            console.error('❌ API 請求失敗:', errorText);
        }
    } catch (error) {
        console.error('❌ 測試加班取消通知失敗:', error);
    }
}

async function checkLineUserState(jun) {
    if (!jun) {
        console.log('❌ 無法檢查：鈞未註冊\n');
        return;
    }

    console.log('🔍 檢查 LineUserState 記錄...\n');
    
    // 我們無法直接查詢資料庫，但可以推測問題
    console.log('💡 可能的問題分析：');
    console.log('1. 鈞在 UserProfile 中已註冊 ✅');
    console.log('2. 鈞可能沒有在 LineUserState 中完成身份選擇');
    console.log('3. sendOvertimeCancelledNotificationExcluding 函數可能有問題');
    console.log('4. LINE API 發送可能失敗');
    console.log('5. 鈞的 LINE 設定可能有問題\n');
}

async function simulateNotificationLogic(jun) {
    if (!jun) {
        console.log('❌ 無法模擬：鈞未註冊\n');
        return;
    }

    console.log('🔬 模擬通知發送邏輯...\n');
    
    console.log('步驟 1: 查找 UserProfile 用戶');
    console.log(`   ✅ 找到鈞: ${jun.memberName} (${jun.team}班 ${jun.role})`);
    console.log(`   ✅ 通知啟用: ${jun.notificationEnabled}`);
    
    console.log('\n步驟 2: 查找 LineUserState 用戶');
    console.log('   ❓ 無法直接檢查，但這可能是問題所在');
    
    console.log('\n步驟 3: 合併用戶列表');
    console.log('   ❓ 如果 LineUserState 中沒有鈞的記錄，可能會被遺漏');
    
    console.log('\n步驟 4: 排除邏輯');
    console.log('   ✅ 鈞不在排除名單中');
    
    console.log('\n步驟 5: LINE API 發送');
    console.log('   ❓ 這裡可能失敗');
    
    console.log('\n🎯 建議檢查：');
    console.log('1. 確認鈞在 LINE Bot 中完成了身份選擇');
    console.log('2. 檢查 sendOvertimeCancelledNotificationExcluding 的日誌');
    console.log('3. 測試直接發送訊息給鈞');
    console.log('4. 檢查 LINE Bot 的權限設定');
}

async function createTestDirectMessageAPI() {
    console.log('\n📝 建議創建測試 API...\n');
    
    console.log('需要創建 /api/test-direct-message 來測試直接發送訊息：');
    console.log(`
// src/app/api/test-direct-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const { lineUserId, message } = await request.json();
        
        await client.pushMessage(lineUserId, {
            type: 'text',
            text: message
        });
        
        return NextResponse.json({ success: true, message: '訊息發送成功' });
    } catch (error) {
        console.error('發送測試訊息失敗:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
    `);
}

async function main() {
    console.log('🚀 開始深度診斷鈞的通知問題\n');
    console.log('='.repeat(60) + '\n');
    
    // 1. 檢查鈞的新狀態
    const jun = await checkJunNewStatus();
    
    console.log('='.repeat(60) + '\n');
    
    // 2. 檢查 LineUserState
    await checkLineUserState(jun);
    
    console.log('='.repeat(60) + '\n');
    
    // 3. 模擬通知邏輯
    await simulateNotificationLogic(jun);
    
    console.log('='.repeat(60) + '\n');
    
    // 4. 測試加班取消通知
    await testOvertimeCancellationWithLogs(jun);
    
    console.log('='.repeat(60) + '\n');
    
    // 5. 測試直接訊息
    await testDirectLineMessage(jun);
    
    console.log('='.repeat(60) + '\n');
    
    // 6. 建議創建測試 API
    await createTestDirectMessageAPI();
    
    console.log('='.repeat(60) + '\n');
    
    console.log('🎯 診斷總結：');
    if (jun) {
        console.log('✅ 鈞已重新註冊');
        console.log('❓ 問題可能在於 LineUserState 或 LINE API 發送');
        console.log('💡 建議：創建測試 API 來直接測試 LINE 訊息發送');
    } else {
        console.log('❌ 鈞尚未重新註冊，請先完成身份設定');
    }
}

main();
