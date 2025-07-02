import { NextRequest, NextResponse } from 'next/server';
import { sendTestMessage } from '@/services/lineBot';

/**
 * POST - 測試發送LINE訊息
 */
export async function POST(request: NextRequest) {
    try {
        const { lineUserId, message } = await request.json();

        if (!lineUserId) {
            return NextResponse.json(
                { error: '請提供 LINE User ID' },
                { status: 400 }
            );
        }

        // 發送測試訊息
        const success = await sendTestMessage(lineUserId);

        if (success) {
            return NextResponse.json({ 
                success: true, 
                message: '測試訊息發送成功' 
            });
        } else {
            return NextResponse.json(
                { error: '發送訊息失敗' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('測試LINE訊息發送失敗:', error);
        return NextResponse.json(
            { error: '伺服器錯誤' },
            { status: 500 }
        );
    }
}

/**
 * GET - 測試LINE Bot連接
 */
export async function GET() {
    try {
        // 檢查環境變數
        const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const channelSecret = process.env.LINE_CHANNEL_SECRET;

        if (!accessToken || !channelSecret) {
            return NextResponse.json(
                { 
                    error: 'LINE 環境變數未設定',
                    details: {
                        hasAccessToken: !!accessToken,
                        hasChannelSecret: !!channelSecret
                    }
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'LINE Bot 設定正常',
            config: {
                hasAccessToken: true,
                hasChannelSecret: true,
                channelId: process.env.LINE_CHANNEL_ID
            }
        });

    } catch (error) {
        console.error('檢查LINE設定失敗:', error);
        return NextResponse.json(
            { error: '檢查設定時發生錯誤' },
            { status: 500 }
        );
    }
}
