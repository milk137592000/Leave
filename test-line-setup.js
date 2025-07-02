// 測試Line Bot設定的簡單腳本
// 在獲得Channel Access Token後可以執行此測試

const testLineSetup = async () => {
    const channelAccessToken = 'YOUR_CHANNEL_ACCESS_TOKEN'; // 請替換為實際的token
    const userId = 'U55508e69afeffef5f001175fff31c9a4';
    
    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
                to: userId,
                messages: [{
                    type: 'text',
                    text: '🎉 Line Bot 設定測試成功！\n\n您的加班通知系統已準備就緒。\n請輸入「選擇名稱」開始設定。'
                }]
            })
        });
        
        if (response.ok) {
            console.log('✅ 測試訊息發送成功！');
            console.log('請檢查您的Line是否收到測試訊息。');
        } else {
            const error = await response.text();
            console.log('❌ 測試失敗:', error);
        }
    } catch (error) {
        console.log('❌ 測試錯誤:', error.message);
    }
};

// 使用方法：
// 1. 將 YOUR_CHANNEL_ACCESS_TOKEN 替換為實際的token
// 2. 在瀏覽器控制台或Node.js中執行此函數
console.log('請先設定Channel Access Token，然後執行 testLineSetup()');
