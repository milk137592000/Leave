import { Client, Message, TextMessage } from '@line/bot-sdk';

// LINE Bot 客戶端配置
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// 創建 LINE Bot 客戶端
const client = new Client(config);

export interface OvertimeNotification {
    requesterName: string;
    requesterTeam: string;
    date: string;
    period: string;
    suggestedTeam: string;
    reason: string;
}

/**
 * 發送加班通知給指定的 LINE 用戶
 */
export async function sendOvertimeNotification(
    lineUserId: string,
    notification: OvertimeNotification
): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: createOvertimeMessage(notification)
        };

        await client.pushMessage(lineUserId, message);
        console.log(`加班通知已發送給用戶: ${lineUserId}`);
        return true;
    } catch (error) {
        console.error('發送 LINE 訊息失敗:', error);
        return false;
    }
}

/**
 * 批量發送加班通知給多個用戶
 */
export async function sendOvertimeNotificationToMultiple(
    lineUserIds: string[],
    notification: OvertimeNotification
): Promise<{ success: string[], failed: string[] }> {
    const results = {
        success: [] as string[],
        failed: [] as string[]
    };

    for (const userId of lineUserIds) {
        const success = await sendOvertimeNotification(userId, notification);
        if (success) {
            results.success.push(userId);
        } else {
            results.failed.push(userId);
        }
    }

    return results;
}

/**
 * 創建加班通知訊息內容
 */
function createOvertimeMessage(notification: OvertimeNotification): string {
    const { requesterName, requesterTeam, date, period, suggestedTeam, reason } = notification;
    
    return `🔔 加班通知

📅 日期：${date}
👤 請假人員：${requesterTeam}班 ${requesterName}
⏰ 時段：${period}

💼 建議加班班級：${suggestedTeam}班
📝 原因：${reason}

如果您可以協助加班，請聯繫相關負責人。
感謝您的配合！`;
}

/**
 * 發送測試訊息
 */
export async function sendTestMessage(lineUserId: string): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: '🎉 LINE 連動測試成功！\n您已成功設定身份，將會收到相關的加班通知。'
        };

        await client.pushMessage(lineUserId, message);
        return true;
    } catch (error) {
        console.error('發送測試訊息失敗:', error);
        return false;
    }
}

/**
 * 驗證 LINE Bot 配置
 */
export function validateLineConfig(): boolean {
    return !!(config.channelAccessToken && config.channelSecret);
}
