const { Client } = require('@line/bot-sdk');
require('dotenv').config({ path: '.env.local' });

// LINE Bot 配置
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// 鈞的 LINE User ID
const junLineUserId = 'U55508e69afeffef5f001175fff31c9a4';

function createOvertimeMessage(notification) {
    const { requesterName, requesterTeam, date, period, suggestedTeam, reason } = notification;
    
    // 構建加班頁面網址
    const overtimeUrl = `https://leave-ten.vercel.app/leave/${date}`;
    
    return `🔔 加班通知

📅 日期：${date}
👤 請假人員：${requesterTeam}班 ${requesterName}
⏰ 時段：${period}

💼 建議加班班級：${suggestedTeam}班
📝 原因：${reason}

🌐 點擊前往加班頁面：
${overtimeUrl}

如果您可以協助加班，請聯繫相關負責人。
感謝您的配合！`;
}

async function testNewNotificationFormat() {
    try {
        console.log('🧪 測試新的加班通知格式（包含網址）...\n');
        
        const notification = {
            requesterName: '科',
            requesterTeam: 'D',
            date: '2025-07-06',
            period: '全天',
            suggestedTeam: 'C',
            reason: '測試：D班科請假，需要C班支援'
        };

        const messageText = createOvertimeMessage(notification);
        
        console.log('📋 新的通知內容:');
        console.log('=' * 50);
        console.log(messageText);
        console.log('=' * 50);

        const message = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(junLineUserId, message);
        console.log('\n✅ 包含網址的加班通知發送成功！');
        console.log('📱 請檢查鈞的LINE是否收到包含網址的通知');
        
    } catch (error) {
        console.error('❌ 發送失敗:', error);
        
        if (error.response) {
            console.error('HTTP狀態:', error.response.status);
            console.error('錯誤詳情:', error.response.data);
        }
    }
}

async function testMultipleOpportunities() {
    try {
        console.log('\n🔔 測試多個加班機會通知格式...\n');
        
        const memberName = '鈞';
        const opportunities = [
            {
                record: { date: '2025-07-06', team: 'D', name: '科' },
                reason: 'D班科請假，C班可以協助加班'
            },
            {
                record: { date: '2025-07-07', team: 'A', name: '小雞' },
                reason: 'A班小雞請假，C班可以協助加班'
            }
        ];

        let messageText = `🔔 ${memberName}，您有以下加班機會：\n\n`;

        opportunities.forEach((opp, index) => {
            const { record, reason } = opp;
            const overtimeUrl = `https://leave-ten.vercel.app/leave/${record.date}`;
            
            messageText += `${index + 1}. 📅 ${record.date}\n`;
            messageText += `   👤 ${record.team}班 ${record.name} 請假\n`;
            messageText += `   💼 ${reason}\n`;
            messageText += `   🌐 加班頁面：${overtimeUrl}\n\n`;
        });

        messageText += '如果您願意加班，請聯繫相關負責人確認。';
        
        console.log('📋 多個加班機會通知內容:');
        console.log('=' * 50);
        console.log(messageText);
        console.log('=' * 50);

        const message = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(junLineUserId, message);
        console.log('\n✅ 多個加班機會通知發送成功！');
        
    } catch (error) {
        console.error('❌ 發送多個機會通知失敗:', error);
    }
}

async function main() {
    console.log('🚀 測試包含網址的LINE通知功能...\n');
    
    // 檢查環境變數
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
        console.error('❌ 缺少 LINE_CHANNEL_ACCESS_TOKEN 環境變數');
        return;
    }
    
    console.log('✅ LINE環境變數已設定');
    
    // 測試單個加班通知
    await testNewNotificationFormat();
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 測試多個加班機會通知
    await testMultipleOpportunities();
    
    console.log('\n🎯 測試完成！');
    console.log('\n💡 新功能：');
    console.log('- ✅ 加班通知現在包含直接連結到加班頁面的網址');
    console.log('- ✅ 用戶可以直接點擊網址前往對應日期的加班頁面');
    console.log('- ✅ 支援單個通知和多個加班機會通知');
}

main().catch(console.error);
