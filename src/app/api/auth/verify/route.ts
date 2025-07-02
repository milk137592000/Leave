import { NextRequest, NextResponse } from 'next/server';
import { verifyUserAuth } from '@/lib/auth';

/**
 * POST - 驗證用戶身份和權限
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lineUserId, requestedMemberName } = body;

        if (!lineUserId) {
            return NextResponse.json(
                { error: '缺少 LINE User ID' },
                { status: 400 }
            );
        }

        // 使用驗證函數
        const authResult = await verifyUserAuth(lineUserId, requestedMemberName);

        if (!authResult.success) {
            const status = authResult.code === 'USER_NOT_SETUP' ? 403 : 403;
            const response: any = {
                error: authResult.error,
                code: authResult.code
            };

            if (authResult.code === 'USER_NOT_SETUP') {
                response.redirectTo = '/line-setup';
            }

            if (authResult.code === 'UNAUTHORIZED_MEMBER') {
                response.allowedMember = authResult.allowedMember;
            }

            return NextResponse.json(response, { status });
        }

        return NextResponse.json({
            success: true,
            user: authResult.user
        });

    } catch (error: any) {
        console.error('身份驗證失敗:', error);
        return NextResponse.json(
            { error: '身份驗證失敗' },
            { status: 500 }
        );
    }
}


