import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, MessageEvent, PostbackEvent } from '@line/bot-sdk';
import crypto from 'crypto';
import {
    getUserState,
    setUserState,
    clearUserState,
    sendNameSelectionMessage,
    handleNameSelection,
    handleUserCommand,
    validateLineConfig
} from '@/services/lineBot';

/**
 * 驗證 LINE Webhook 簽名
 */
function validateSignature(body: string, signature: string): boolean {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    if (!channelSecret) {
        console.error('LINE_CHANNEL_SECRET 未設定');
        return false;
    }

    const hash = crypto
        .createHmac('sha256', channelSecret)
        .update(body)
        .digest('base64');

    return hash === signature;
}

/**
 * POST - 處理 LINE Webhook 事件
 */
export async function POST(request: NextRequest) {
    try {
        // 檢查 LINE Bot 配置
        if (!validateLineConfig()) {
            console.error('LINE Bot 配置不完整');
            return NextResponse.json(
                { error: 'LINE Bot 配置不完整' },
                { status: 500 }
            );
        }

        // 獲取請求內容
        const body = await request.text();
        const signature = request.headers.get('x-line-signature');

        if (!signature) {
            console.error('缺少 LINE 簽名');
            return NextResponse.json(
                { error: '缺少簽名' },
                { status: 400 }
            );
        }

        // 驗證簽名
        if (!validateSignature(body, signature)) {
            console.error('LINE 簽名驗證失敗');
            return NextResponse.json(
                { error: '簽名驗證失敗' },
                { status: 401 }
            );
        }

        // 解析事件
        const data = JSON.parse(body);
        const events: WebhookEvent[] = data.events || [];

        // 處理每個事件
        for (const event of events) {
            await handleLineEvent(event);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('處理 LINE Webhook 失敗:', error);
        return NextResponse.json(
            { error: '處理 Webhook 失敗' },
            { status: 500 }
        );
    }
}

/**
 * 處理 LINE 事件
 */
async function handleLineEvent(event: WebhookEvent): Promise<void> {
    try {
        switch (event.type) {
            case 'message':
                await handleMessageEvent(event as MessageEvent);
                break;
            case 'postback':
                await handlePostbackEvent(event as PostbackEvent);
                break;
            case 'follow':
                await handleFollowEvent(event);
                break;
            default:
                console.log('未處理的事件類型:', event.type);
        }
    } catch (error) {
        console.error('處理 LINE 事件失敗:', error);
    }
}

/**
 * 處理訊息事件
 */
async function handleMessageEvent(event: MessageEvent): Promise<void> {
    if (event.message.type !== 'text') {
        return;
    }

    const userId = event.source.userId;
    if (!userId) {
        return;
    }

    const messageText = event.message.text.trim();
    const userState = await getUserState(userId);

    // 處理特殊指令
    if (messageText === '選擇名稱' || messageText === '重新選擇' || messageText === '開始') {
        await sendNameSelectionMessage(userId);
        return;
    }

    // 嘗試處理用戶指令
    const commandHandled = await handleUserCommand(userId, messageText);
    if (commandHandled) {
        return;
    }

    // 處理狀態相關的訊息
    switch (userState.step) {
        case 'waiting_name_selection':
            // 如果用戶直接輸入名稱而不是使用快速回覆
            await handleNameSelection(userId, messageText);
            break;
        case 'name_selected':
            // 用戶已選擇名稱，提供幫助訊息
            await sendHelpMessage(userId);
            break;
        default:
            // 預設情況，引導用戶選擇名稱
            await sendNameSelectionMessage(userId);
    }
}

/**
 * 處理 Postback 事件
 */
async function handlePostbackEvent(event: PostbackEvent): Promise<void> {
    const userId = event.source.userId;
    if (!userId) {
        return;
    }

    const data = event.postback.data;
    const params = new URLSearchParams(data);
    const action = params.get('action');

    switch (action) {
        case 'select_name':
            const selectedName = params.get('name');
            if (selectedName) {
                await handleNameSelection(userId, selectedName);
            }
            break;
        default:
            console.log('未知的 postback action:', action);
    }
}

/**
 * 處理關注事件
 */
async function handleFollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    if (!userId) {
        return;
    }

    // 清除舊的用戶狀態
    clearUserState(userId);
    
    // 發送歡迎訊息並引導選擇名稱
    await sendWelcomeMessage(userId);
}

/**
 * 發送歡迎訊息
 */
async function sendWelcomeMessage(userId: string): Promise<void> {
    const { Client } = await import('@line/bot-sdk');
    const client = new Client({
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
        channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    });

    try {
        const message = {
            type: 'text' as const,
            text: '🎉 歡迎使用加班通知系統！\n\n請先選擇您的名稱，以便接收相關的加班通知。\n\n請輸入「選擇名稱」開始設定。'
        };

        await client.pushMessage(userId, message);
    } catch (error) {
        console.error('發送歡迎訊息失敗:', error);
    }
}

/**
 * 發送幫助訊息
 */
async function sendHelpMessage(userId: string): Promise<void> {
    const { Client } = await import('@line/bot-sdk');
    const client = new Client({
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
        channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    });

    try {
        const userState = await getUserState(userId);
        const message = {
            type: 'text' as const,
            text: `您好 ${userState.selectedName}！\n\n🔔 您已設定完成，將會收到相關的加班通知。\n\n📋 可用指令：\n• 重新選擇 - 重新選擇名稱\n• 選擇名稱 - 顯示名稱選單\n\n如有任何問題，請聯繫系統管理員。`
        };

        await client.pushMessage(userId, message);
    } catch (error) {
        console.error('發送幫助訊息失敗:', error);
    }
}

/**
 * GET - 健康檢查
 */
export async function GET() {
    return NextResponse.json({ 
        status: 'ok', 
        message: 'LINE Webhook endpoint is running',
        timestamp: new Date().toISOString()
    });
}
