import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

/**
 * POST - 驗證用戶身份和權限
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { lineUserId, requestedMemberName } = body;
        
        if (!lineUserId) {
            return NextResponse.json(
                { error: '缺少 LINE User ID' },
                { status: 400 }
            );
        }
        
        // 查找用戶資料
        const userProfile = await UserProfile.findOne({ lineUserId });
        
        if (!userProfile) {
            return NextResponse.json(
                { 
                    error: '用戶未設定身份',
                    code: 'USER_NOT_SETUP',
                    redirectTo: '/line-setup'
                },
                { status: 403 }
            );
        }
        
        // 如果有指定請假人員名稱，檢查是否為本人
        if (requestedMemberName && requestedMemberName !== userProfile.memberName) {
            return NextResponse.json(
                { 
                    error: '您只能為自己請假',
                    code: 'UNAUTHORIZED_MEMBER',
                    allowedMember: userProfile.memberName
                },
                { status: 403 }
            );
        }
        
        return NextResponse.json({
            success: true,
            user: {
                lineUserId: userProfile.lineUserId,
                displayName: userProfile.displayName,
                team: userProfile.team,
                role: userProfile.role,
                memberName: userProfile.memberName
            }
        });
        
    } catch (error: any) {
        console.error('身份驗證失敗:', error);
        return NextResponse.json(
            { error: '身份驗證失敗' },
            { status: 500 }
        );
    }
}

/**
 * 驗證用戶身份的輔助函數
 * 可以在其他 API 路由中使用
 */
export async function verifyUserAuth(lineUserId: string, requestedMemberName?: string) {
    try {
        await connectDB();
        
        const userProfile = await UserProfile.findOne({ lineUserId });
        
        if (!userProfile) {
            return {
                success: false,
                error: '用戶未設定身份',
                code: 'USER_NOT_SETUP'
            };
        }
        
        if (requestedMemberName && requestedMemberName !== userProfile.memberName) {
            return {
                success: false,
                error: '您只能為自己請假',
                code: 'UNAUTHORIZED_MEMBER',
                allowedMember: userProfile.memberName
            };
        }
        
        return {
            success: true,
            user: {
                lineUserId: userProfile.lineUserId,
                displayName: userProfile.displayName,
                team: userProfile.team,
                role: userProfile.role,
                memberName: userProfile.memberName
            }
        };
        
    } catch (error) {
        console.error('身份驗證失敗:', error);
        return {
            success: false,
            error: '身份驗證失敗',
            code: 'VERIFICATION_ERROR'
        };
    }
}
