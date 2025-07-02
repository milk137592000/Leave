import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import { getTeamsForDate } from '@/data/teams';
import { sendTestMessage } from '@/services/lineBot';

// GET - 獲取用戶資料
export async function GET(request: NextRequest) {
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
        
        const userProfile = await UserProfile.findOne({ lineUserId });
        
        if (!userProfile) {
            return NextResponse.json(
                { exists: false },
                { status: 200 }
            );
        }
        
        return NextResponse.json({
            exists: true,
            profile: {
                lineUserId: userProfile.lineUserId,
                displayName: userProfile.displayName,
                team: userProfile.team,
                role: userProfile.role,
                memberName: userProfile.memberName,
                notificationEnabled: userProfile.notificationEnabled
            }
        });
        
    } catch (error) {
        console.error('獲取用戶資料失敗:', error);
        return NextResponse.json(
            { error: '獲取用戶資料失敗' },
            { status: 500 }
        );
    }
}

// POST - 創建或更新用戶資料
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { lineUserId, displayName, pictureUrl, team, role, memberName } = body;
        
        // 驗證必要欄位
        if (!lineUserId || !displayName || !team || !role || !memberName) {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }
        
        // 驗證團隊和角色
        const teams = getTeamsForDate(new Date());
        const teamData = teams[team];
        
        if (!teamData) {
            return NextResponse.json(
                { error: '無效的班級' },
                { status: 400 }
            );
        }
        
        const memberExists = teamData.members.some(
            member => member.name === memberName && member.role === role
        );
        
        if (!memberExists) {
            return NextResponse.json(
                { error: '該成員不存在於指定班級中' },
                { status: 400 }
            );
        }

        // 檢查該 LINE 用戶是否已經綁定身份
        const currentUserProfile = await UserProfile.findOne({ lineUserId });
        if (currentUserProfile) {
            return NextResponse.json(
                { error: '您已經設定過身份，無法重新設定' },
                { status: 409 }
            );
        }

        // 檢查該成員是否已被其他 LINE 用戶綁定
        const existingProfile = await UserProfile.findOne({
            memberName,
            lineUserId: { $ne: lineUserId }
        });

        if (existingProfile) {
            return NextResponse.json(
                { error: '該成員已被其他 LINE 帳號綁定' },
                { status: 409 }
            );
        }
        
        // 創建新的用戶資料（不允許更新）
        const userProfile = new UserProfile({
            lineUserId,
            displayName,
            pictureUrl,
            team,
            role,
            memberName,
            notificationEnabled: true
        });

        await userProfile.save();
        
        // 發送測試訊息
        await sendTestMessage(lineUserId);
        
        return NextResponse.json({
            success: true,
            profile: {
                lineUserId: userProfile.lineUserId,
                displayName: userProfile.displayName,
                team: userProfile.team,
                role: userProfile.role,
                memberName: userProfile.memberName,
                notificationEnabled: userProfile.notificationEnabled
            }
        });
        
    } catch (error: any) {
        console.error('保存用戶資料失敗:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: '該成員已被綁定' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: '保存用戶資料失敗' },
            { status: 500 }
        );
    }
}

// PUT - 更新通知設定
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { lineUserId, notificationEnabled } = body;
        
        if (!lineUserId || typeof notificationEnabled !== 'boolean') {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }
        
        const userProfile = await UserProfile.findOneAndUpdate(
            { lineUserId },
            { notificationEnabled },
            { new: true }
        );
        
        if (!userProfile) {
            return NextResponse.json(
                { error: '用戶不存在' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            notificationEnabled: userProfile.notificationEnabled
        });
        
    } catch (error) {
        console.error('更新通知設定失敗:', error);
        return NextResponse.json(
            { error: '更新通知設定失敗' },
            { status: 500 }
        );
    }
}
