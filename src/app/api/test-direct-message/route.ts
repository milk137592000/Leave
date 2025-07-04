import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const { lineUserId, message } = await request.json();
        
        if (!lineUserId || !message) {
            return NextResponse.json(
                { error: '缺少必要參數：lineUserId 或 message' },
                { status: 400 }
            );
        }

        console.log(`發送測試訊息給 ${lineUserId}: ${message}`);
        
        await client.pushMessage(lineUserId, {
            type: 'text',
            text: message
        });
        
        console.log('測試訊息發送成功');
        
        return NextResponse.json({ 
            success: true, 
            message: '訊息發送成功',
            lineUserId,
            sentMessage: message
        });
        
    } catch (error) {
        console.error('發送測試訊息失敗:', error);
        
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : '未知錯誤',
            lineUserId: request.body ? JSON.parse(await request.text()).lineUserId : 'unknown'
        }, { status: 500 });
    }
}
