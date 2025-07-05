import { NextRequest, NextResponse } from 'next/server';
import { sendOvertimeCancelledNotification } from '@/services/lineBot';

/**
 * POST - 除錯 LINE 訊息發送
 */
export async function POST(request: NextRequest) {
    try {
        const { lineUserId, memberName, testData } = await request.json();
        
        console.log('🧪 開始除錯 LINE 訊息發送...');
        console.log(`📱 目標用戶: ${memberName} (${lineUserId})`);
        
        // 預設測試資料
        const cancelledOpportunity = testData || {
            date: '2025-07-05',
            requesterName: '測試用戶',
            requesterTeam: 'A',
            reason: '除錯測試：檢查 LINE API 發送'
        };
        
        console.log('📋 測試資料:', cancelledOpportunity);
        
        // 檢查環境變數
        const hasAccessToken = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const hasChannelSecret = !!process.env.LINE_CHANNEL_SECRET;
        
        console.log('🔧 環境變數檢查:');
        console.log(`- ACCESS_TOKEN: ${hasAccessToken ? '✅' : '❌'}`);
        console.log(`- CHANNEL_SECRET: ${hasChannelSecret ? '✅' : '❌'}`);
        
        if (!hasAccessToken || !hasChannelSecret) {
            return NextResponse.json({
                error: 'LINE Bot 環境變數未設定',
                hasAccessToken,
                hasChannelSecret
            }, { status: 500 });
        }
        
        // 嘗試發送訊息
        console.log('📤 嘗試發送 LINE 訊息...');
        const success = await sendOvertimeCancelledNotification(
            lineUserId,
            memberName,
            cancelledOpportunity
        );
        
        console.log(`📊 發送結果: ${success ? '✅ 成功' : '❌ 失敗'}`);
        
        return NextResponse.json({
            success,
            message: success ? '訊息發送成功' : '訊息發送失敗',
            testData: {
                lineUserId,
                memberName,
                cancelledOpportunity,
                hasAccessToken,
                hasChannelSecret
            }
        });
        
    } catch (error) {
        console.error('❌ 除錯 API 發生錯誤:', error);
        
        // 詳細錯誤資訊
        let errorDetails: any = {
            message: error instanceof Error ? error.message : '未知錯誤',
            name: error instanceof Error ? error.name : 'UnknownError',
            stack: error instanceof Error ? error.stack : undefined
        };
        
        // 如果是 LINE API 錯誤
        if (error && typeof error === 'object' && 'response' in error) {
            const lineError = error as any;
            errorDetails = {
                ...errorDetails,
                statusCode: lineError.response?.status,
                statusMessage: lineError.response?.statusText,
                responseData: lineError.response?.data
            };
        }
        
        console.error('🔍 詳細錯誤資訊:', errorDetails);
        
        return NextResponse.json({
            error: '除錯過程發生錯誤',
            details: errorDetails
        }, { status: 500 });
    }
}

/**
 * GET - 獲取除錯資訊
 */
export async function GET() {
    try {
        // 檢查環境變數
        const hasAccessToken = !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const hasChannelSecret = !!process.env.LINE_CHANNEL_SECRET;
        
        // 檢查 ACCESS_TOKEN 的格式（不洩露完整 token）
        const tokenPreview = process.env.LINE_CHANNEL_ACCESS_TOKEN 
            ? `${process.env.LINE_CHANNEL_ACCESS_TOKEN.substring(0, 10)}...`
            : 'undefined';
            
        return NextResponse.json({
            environment: 'Vercel/Production',
            lineBot: {
                hasAccessToken,
                hasChannelSecret,
                tokenPreview
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ 獲取除錯資訊失敗:', error);
        return NextResponse.json({
            error: '獲取除錯資訊失敗'
        }, { status: 500 });
    }
}
