import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

// GET - 獲取所有用戶列表
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const users = await UserProfile.find({})
            .select('lineUserId displayName team role memberName notificationEnabled createdAt')
            .sort({ team: 1, role: 1, memberName: 1 });
        
        const userList = users.map(user => ({
            lineUserId: user.lineUserId,
            displayName: user.displayName,
            team: user.team,
            role: user.role,
            memberName: user.memberName,
            notificationEnabled: user.notificationEnabled,
            createdAt: user.createdAt.toISOString()
        }));
        
        return NextResponse.json({
            success: true,
            users: userList,
            total: userList.length
        });
        
    } catch (error) {
        console.error('獲取用戶列表失敗:', error);
        return NextResponse.json(
            { error: '獲取用戶列表失敗' },
            { status: 500 }
        );
    }
}

// DELETE - 刪除用戶（管理功能）
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const lineUserId = searchParams.get('lineUserId');
        
        if (!lineUserId) {
            return NextResponse.json(
                { error: '缺少 LINE User ID' },
                { status: 400 }
            );
        }
        
        const deletedUser = await UserProfile.findOneAndDelete({ lineUserId });
        
        if (!deletedUser) {
            return NextResponse.json(
                { error: '用戶不存在' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: '用戶已刪除',
            deletedUser: {
                displayName: deletedUser.displayName,
                memberName: deletedUser.memberName,
                team: deletedUser.team
            }
        });
        
    } catch (error) {
        console.error('刪除用戶失敗:', error);
        return NextResponse.json(
            { error: '刪除用戶失敗' },
            { status: 500 }
        );
    }
}
