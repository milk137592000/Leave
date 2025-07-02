const { Client } = require('@line/bot-sdk');
require('dotenv').config({ path: '.env.local' });

async function testLineConnection() {
    console.log('🔍 測試 LINE Bot 設定...');
    
    // 檢查環境變數
    const requiredEnvs = {
        'LIFF_ID': process.env.LIFF_ID,
        'LINE_CHANNEL_ACCESS_TOKEN': process.env.LINE_CHANNEL_ACCESS_TOKEN,
        'LINE_CHANNEL_SECRET': process.env.LINE_CHANNEL_SECRET
    };
    
    console.log('\n📋 環境變數檢查:');
    let allSet = true;
    
    for (const [key, value] of Object.entries(requiredEnvs)) {
        if (!value || value.includes('請填入')) {
            console.log(`❌ ${key}: 未設定`);
            allSet = false;
        } else {
            console.log(`✅ ${key}: 已設定`);
        }
    }
    
    if (!allSet) {
        console.log('\n⚠️  請先完成 LINE 環境變數設定');
        console.log('📝 設定步驟:');
        console.log('1. 前往 https://developers.line.biz/console/');
        console.log('2. 建立 Messaging API Channel');
        console.log('3. 建立 LIFF App');
        console.log('4. 將取得的值填入 .env.local 檔案');
        return;
    }
    
    try {
        // 建立 LINE Bot 客戶端
        const client = new Client({
            channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
            channelSecret: process.env.LINE_CHANNEL_SECRET,
        });
        
        console.log('\n🤖 測試 LINE Bot 連接...');
        
        // 測試取得 Bot 資訊
        const botInfo = await client.getBotInfo();
        console.log('✅ LINE Bot 連接成功！');
        console.log(`📱 Bot 名稱: ${botInfo.displayName}`);
        console.log(`🆔 Bot ID: ${botInfo.userId}`);
        console.log(`📷 頭像: ${botInfo.pictureUrl ? '已設定' : '未設定'}`);
        
        // 測試 LIFF ID 格式
        const liffIdPattern = /^\d{10}-[a-zA-Z0-9]{8}$/;
        if (liffIdPattern.test(process.env.LIFF_ID)) {
            console.log('✅ LIFF ID 格式正確');
        } else {
            console.log('⚠️  LIFF ID 格式可能不正確');
            console.log('   正確格式: 1234567890-abcdefgh');
        }
        
        console.log('\n🎉 LINE 設定測試完成！');
        console.log('\n📋 下一步:');
        console.log('1. 重新啟動開發服務器: npm run dev');
        console.log('2. 在 LINE Developers Console 設定 Webhook URL');
        console.log('3. 測試 LINE 登入功能');
        
    } catch (error) {
        console.error('\n❌ LINE Bot 連接失敗:');
        
        if (error.statusCode === 401) {
            console.error('🔧 認證失敗 - 請檢查:');
            console.error('   1. Channel Access Token 是否正確');
            console.error('   2. Channel Secret 是否正確');
        } else if (error.statusCode === 403) {
            console.error('🔧 權限不足 - 請檢查:');
            console.error('   1. Channel Access Token 是否有效');
            console.error('   2. 是否已啟用 Messaging API');
        } else {
            console.error('🔧 其他錯誤:');
            console.error(`   狀態碼: ${error.statusCode}`);
            console.error(`   錯誤訊息: ${error.message}`);
        }
        
        console.error('\n📝 詳細錯誤:', error);
    }
}

// 執行測試
testLineConnection();
