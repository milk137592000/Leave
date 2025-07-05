import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import { sendOvertimeNotificationToMultiple, OvertimeNotification } from '@/services/lineBot';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { 
            requesterName, 
            requesterTeam, 
            date, 
            period, 
            suggestedTeam, 
            reason 
        } = body;
        
        // 驗證必要欄位
        if (!requesterName || !requesterTeam || !date || !period || !suggestedTeam) {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }

        // 檢查禮拜二大休班級限制
        const isTuesday = new Date(date).getDay() === 2; // 0=週日, 1=週一, 2=週二...
        if (isTuesday) {
            // 檢查建議班級是否為大休
            const { getShiftForDate } = await import('@/utils/schedule');
            const suggestedTeamShift = getShiftForDate(new Date(date), suggestedTeam);

            if (suggestedTeamShift === '大休') {
                console.log(`⚠️  禮拜二限制：${suggestedTeam}班大休不得加班 (${date})`);
                return NextResponse.json({
                    success: true,
                    message: '禮拜二大休班級不得加班，跳過通知',
                    notified: 0,
                    skipped: true,
                    reason: '禮拜二大休班級限制'
                });
            }
        }
        
        // 查找建議班級的所有成員
        const targetUsers = await UserProfile.find({
            team: suggestedTeam,
            notificationEnabled: true
        });
        
        if (targetUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: '沒有找到可通知的用戶',
                notified: 0
            });
        }
        
        // 準備通知內容
        const notification: OvertimeNotification = {
            requesterName,
            requesterTeam,
            date,
            period,
            suggestedTeam,
            reason: reason || '班級人員請假，需要加班支援'
        };
        
        // 發送通知
        const lineUserIds = targetUsers.map(user => user.lineUserId);
        const results = await sendOvertimeNotificationToMultiple(lineUserIds, notification);
        
        // 記錄發送結果
        console.log('加班通知發送結果:', {
            總用戶數: targetUsers.length,
            成功發送: results.success.length,
            發送失敗: results.failed.length,
            建議班級: suggestedTeam,
            請假人員: `${requesterTeam}班 ${requesterName}`
        });
        
        return NextResponse.json({
            success: true,
            message: '通知發送完成',
            notified: results.success.length,
            failed: results.failed.length,
            details: {
                targetTeam: suggestedTeam,
                totalUsers: targetUsers.length,
                successfulSends: results.success.length,
                failedSends: results.failed.length
            }
        });
        
    } catch (error) {
        console.error('發送加班通知失敗:', error);
        return NextResponse.json(
            { error: '發送通知失敗' },
            { status: 500 }
        );
    }
}

// GET - 獲取可通知的用戶列表（用於測試）
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const team = searchParams.get('team');
        
        if (!team) {
            return NextResponse.json(
                { error: '請指定班級' },
                { status: 400 }
            );
        }
        
        const users = await UserProfile.find({
            team,
            notificationEnabled: true
        }).select('displayName memberName role lineUserId');
        
        return NextResponse.json({
            team,
            users: users.map(user => ({
                displayName: user.displayName,
                memberName: user.memberName,
                role: user.role,
                hasLineId: !!user.lineUserId
            }))
        });
        
    } catch (error) {
        console.error('獲取用戶列表失敗:', error);
        return NextResponse.json(
            { error: '獲取用戶列表失敗' },
            { status: 500 }
        );
    }
}
