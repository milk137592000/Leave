import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

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
