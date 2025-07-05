import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

// 直接 LINE API 調用的備用方案
async function sendLineMessageDirect(lineUserId: string, message: string): Promise<boolean> {
    try {
        const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();

        if (!accessToken) {
            console.error('❌ LINE_CHANNEL_ACCESS_TOKEN 未設定');
            return false;
        }

        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: lineUserId,
                messages: [{
                    type: 'text',
                    text: message
                }]
            })
        });

        if (response.ok) {
            console.log('✅ 直接 LINE API 調用成功');
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ 直接 LINE API 調用失敗:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ 直接 LINE API 調用異常:', error);
        return false;
    }
}

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

        // 首先嘗試使用 LINE SDK
        let success = false;
        let method = '';

        try {
            await client.pushMessage(lineUserId, {
                type: 'text',
                text: message
            });
            success = true;
            method = 'SDK';
            console.log('測試訊息發送成功 (使用 SDK)');
        } catch (sdkError) {
            console.warn('⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:', sdkError);

            // 備用方案：直接調用 LINE API
            success = await sendLineMessageDirect(lineUserId, message);
            if (success) {
                method = '直接 API';
                console.log('測試訊息發送成功 (使用直接 API)');
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
        
        return NextResponse.json({
            success: true,
            message: `訊息發送成功 (使用 ${method})`,
            lineUserId,
            sentMessage: message,
            method
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
