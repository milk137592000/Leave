/**
 * 重置鈞的 LINE 綁定
 * 這個腳本會刪除鈞的 UserProfile 和 LineUserState 記錄，讓他可以重新綁定
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function resetJunBinding() {
    console.log('🔄 開始重置鈞的 LINE 綁定...\n');

    const baseUrl = process.env.NEXTAUTH_URL || 'https://leave-ten.vercel.app';

    try {
        // 1. 先獲取鈞的當前資料
        console.log('1️⃣ 獲取鈞的當前綁定資料...');
        const usersResponse = await fetch(`${baseUrl}/api/line-admin/users`);
        
        if (!usersResponse.ok) {
            throw new Error(`無法獲取用戶列表: ${usersResponse.status}`);
        }
        
        const usersResult = await usersResponse.json();
        const jun = usersResult.users?.find(u => u.memberName === '鈞');
        
        if (!jun) {
            console.log('❌ 找不到鈞的綁定記錄，可能已經被刪除');
            return;
        }
        
        console.log('✅ 找到鈞的綁定記錄:');
        console.log(`   姓名: ${jun.memberName}`);
        console.log(`   班級: ${jun.team}班`);
        console.log(`   角色: ${jun.role}`);
        console.log(`   LINE ID: ${jun.lineUserId}`);
        console.log(`   註冊時間: ${new Date(jun.createdAt).toLocaleString()}\n`);
        
        // 2. 刪除 UserProfile 記錄
        console.log('2️⃣ 刪除鈞的 UserProfile 記錄...');
        const deleteResponse = await fetch(`${baseUrl}/api/line-admin/users?lineUserId=${encodeURIComponent(jun.lineUserId)}`, {
            method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log('✅ UserProfile 記錄已刪除:', deleteResult.message);
        } else {
            const errorText = await deleteResponse.text();
            console.error('❌ 刪除 UserProfile 失敗:', errorText);
        }
        
        console.log('\n3️⃣ 重置完成！');
        console.log('📱 現在鈞需要重新進行 LINE 身份設定：');
        console.log('   1. 讓鈞點擊 LINE Bot 的身份設定連結');
        console.log('   2. 或者讓鈞直接訪問身份設定頁面');
        console.log('   3. 重新選擇班級、角色和姓名');
        
        console.log('\n🔗 身份設定連結:');
        console.log(`   ${baseUrl}/line-setup`);
        
        console.log('\n⚠️  注意事項：');
        console.log('   - 鈞需要在 LINE 中重新設定身份');
        console.log('   - 設定完成後，系統會生成新的 LINE User ID');
        console.log('   - 之後就能正常收到加班通知了');
        
    } catch (error) {
        console.error('❌ 重置過程發生錯誤:', error);
    }
}

async function createResetInstructions() {
    console.log('\n📋 給鈞的重新綁定指示：');
    console.log('='.repeat(50));
    console.log('1. 打開 LINE 應用程式');
    console.log('2. 找到加班通知機器人');
    console.log('3. 點擊「身份設定」或發送任何訊息');
    console.log('4. 系統會引導您重新設定身份');
    console.log('5. 選擇正確的班級、角色和姓名');
    console.log('6. 完成設定後即可收到通知');
    console.log('='.repeat(50));
}

async function main() {
    await resetJunBinding();
    await createResetInstructions();
    
    console.log('\n🎯 總結：');
    console.log('鈞的舊綁定記錄已刪除，現在可以重新綁定 LINE 身份了！');
}

main();
