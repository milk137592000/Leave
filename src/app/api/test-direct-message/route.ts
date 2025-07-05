import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

export async function POST(request: NextRequest) {
    let lineUserId: string | undefined;

    try {
        const requestBody = await request.json();
        lineUserId = requestBody.lineUserId;
        const message = requestBody.message;
        
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

        // 詳細的錯誤信息
        let errorDetails: any = {
            message: error instanceof Error ? error.message : '未知錯誤',
            name: error instanceof Error ? error.name : 'UnknownError',
            stack: error instanceof Error ? error.stack : undefined
        };

        // 如果是 LINE API 錯誤，提供更多信息
        if (error && typeof error === 'object' && 'response' in error) {
            const lineError = error as any;
            errorDetails = {
                ...errorDetails,
                statusCode: lineError.response?.status,
                statusMessage: lineError.response?.statusText,
                responseData: lineError.response?.data
            };
        }

        console.error('詳細錯誤信息:', errorDetails);

        return NextResponse.json({
            error: errorDetails.message,
            details: errorDetails,
            lineUserId: lineUserId || 'unknown'
        }, { status: 500 });
    }
}
