require('dotenv').config({ path: '.env.local' });

function checkTokenFormat() {
    console.log('🔍 檢查 LINE Channel Access Token 格式...\n');
    
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    
    console.log('📋 基本檢查:');
    console.log(`- ACCESS_TOKEN 存在: ${!!accessToken}`);
    console.log(`- CHANNEL_SECRET 存在: ${!!channelSecret}`);
    
    if (accessToken) {
        console.log(`- ACCESS_TOKEN 長度: ${accessToken.length}`);
        console.log(`- ACCESS_TOKEN 前10字符: ${accessToken.substring(0, 10)}`);
        console.log(`- ACCESS_TOKEN 後10字符: ${accessToken.substring(accessToken.length - 10)}`);
        
        // 檢查特殊字符
        const hasPlus = accessToken.includes('+');
        const hasSlash = accessToken.includes('/');
        const hasEquals = accessToken.includes('=');
        
        console.log('\n🔍 特殊字符檢查:');
        console.log(`- 包含 '+': ${hasPlus}`);
        console.log(`- 包含 '/': ${hasSlash}`);
        console.log(`- 包含 '=': ${hasEquals}`);
        
        // 檢查是否有不可見字符
        const trimmed = accessToken.trim();
        const hasDifference = accessToken.length !== trimmed.length;
        
        console.log('\n🧹 空白字符檢查:');
        console.log(`- 原始長度: ${accessToken.length}`);
        console.log(`- 修剪後長度: ${trimmed.length}`);
        console.log(`- 有多餘空白: ${hasDifference}`);
        
        // 檢查 Base64 格式
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isValidBase64 = base64Regex.test(trimmed);
        
        console.log('\n📝 格式檢查:');
        console.log(`- 符合 Base64 格式: ${isValidBase64}`);
        
        // 嘗試 URL 編碼
        const urlEncoded = encodeURIComponent(trimmed);
        const hasUrlEncodingDifference = urlEncoded !== trimmed;
        
        console.log(`- 需要 URL 編碼: ${hasUrlEncodingDifference}`);
        if (hasUrlEncodingDifference) {
            console.log(`- URL 編碼後: ${urlEncoded.substring(0, 50)}...`);
        }
    }
    
    if (channelSecret) {
        console.log(`\n🔐 CHANNEL_SECRET 長度: ${channelSecret.length}`);
        console.log(`- CHANNEL_SECRET 前10字符: ${channelSecret.substring(0, 10)}`);
    }
    
    console.log('\n💡 建議:');
    if (accessToken && accessToken.includes('+')) {
        console.log('1. ACCESS_TOKEN 包含 + 字符，這可能導致 HTTP 標頭問題');
        console.log('2. 嘗試重新生成 LINE Channel Access Token');
        console.log('3. 或者在程式碼中正確處理 + 字符');
    }
    
    console.log('\n🔧 可能的解決方案:');
    console.log('1. 重新生成 LINE Channel Access Token');
    console.log('2. 檢查 Vercel 環境變數設定');
    console.log('3. 確保 token 沒有被意外修改');
}

checkTokenFormat();
