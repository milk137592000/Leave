import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 檢查所有 LINE 相關的環境變數
        const envCheck = {
            // LIFF 相關
            LIFF_ID: process.env.LIFF_ID ? '已設定' : '未設定',
            NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID ? '已設定' : '未設定',
            LIFF_ID_VALUE: process.env.LIFF_ID || 'undefined',
            NEXT_PUBLIC_LIFF_ID_VALUE: process.env.NEXT_PUBLIC_LIFF_ID || 'undefined',
            
            // LINE Channel 相關
            LINE_LOGIN_CHANNEL_ID: process.env.LINE_LOGIN_CHANNEL_ID ? '已設定' : '未設定',
            LINE_LOGIN_CHANNEL_SECRET: process.env.LINE_LOGIN_CHANNEL_SECRET ? '已設定' : '未設定',
            LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID ? '已設定' : '未設定',
            LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET ? '已設定' : '未設定',
            LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設定' : '未設定',
            
            // 其他環境資訊
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL ? '是' : '否',
            VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
            VERCEL_URL: process.env.VERCEL_URL || 'undefined',
            
            // 時間戳
            timestamp: new Date().toISOString(),
            
            // 檢查 LIFF ID 格式
            liffIdFormat: {
                liffId: process.env.LIFF_ID ? /^\d{10}-[a-zA-Z0-9]{8}$/.test(process.env.LIFF_ID) : false,
                nextPublicLiffId: process.env.NEXT_PUBLIC_LIFF_ID ? /^\d{10}-[a-zA-Z0-9]{8}$/.test(process.env.NEXT_PUBLIC_LIFF_ID) : false
            }
        };

        return NextResponse.json({
            success: true,
            environment: envCheck,
            message: '環境變數檢查完成'
        });

    } catch (error) {
        console.error('環境變數檢查失敗:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: '檢查環境變數時發生錯誤',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
