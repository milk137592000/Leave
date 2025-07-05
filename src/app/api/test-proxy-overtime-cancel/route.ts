import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cancelledByName, cancelledByDisplayName, targetMemberName, date, overtimeTime, overtimeType, reason } = body;

        // 驗證必要參數
        if (!cancelledByName || !targetMemberName || !date || !overtimeTime || !overtimeType) {
            return NextResponse.json(
                { error: '缺少必要參數' },
                { status: 400 }
            );
        }

        // 動態導入 LINE Bot 服務（只在服務端執行）
        const { sendProxyOvertimeCancelNotification } = await import('@/services/lineBot');
        
        const testNotification = {
            cancelledByName,
            cancelledByDisplayName: cancelledByDisplayName || cancelledByName,
            targetMemberName,
            date,
            overtimeTime,
            overtimeType,
            reason
        };

        // 嘗試發送通知
        const success = await sendProxyOvertimeCancelNotification(targetMemberName, testNotification);
        
        if (success) {
            return NextResponse.json({
                success: true,
                message: '代理取消加班通知發送成功'
            });
        } else {
            return NextResponse.json(
                { 
                    success: false,
                    error: '代理取消加班通知發送失敗，可能是找不到對應的 LINE 用戶或 LINE Bot 配置問題'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('測試代理取消加班通知失敗:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : '未知錯誤'
            },
            { status: 500 }
        );
    }
}
