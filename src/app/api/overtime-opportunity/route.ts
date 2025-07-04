import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LineUserState from '@/models/LineUserState';
import UserProfile from '@/models/UserProfile';
import { LeaveRecord } from '@/models/LeaveRecord';
import { sendOvertimeNotification } from '@/services/lineBot';
import { getShiftForDate } from '@/utils/schedule';

/**
 * POST - 通知符合資格的員工有新的加班機會
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { 
            leaveRecordId,
            date,
            requesterName,
            requesterTeam,
            overtimeType,
            halfType // 'first' | 'second' | undefined
        } = body;
        
        if (!leaveRecordId || !date || !requesterName || !requesterTeam) {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }
        
        // 查找請假記錄
        const leaveRecord = await LeaveRecord.findById(leaveRecordId);
        if (!leaveRecord) {
            return NextResponse.json(
                { error: '找不到請假記錄' },
                { status: 404 }
            );
        }
        
        // 查找所有已選擇名稱的Line用戶
        const lineUsers = await LineUserState.find({
            step: 'name_selected',
            selectedName: { $exists: true },
            selectedTeam: { $exists: true },
            selectedRole: { $exists: true }
        });
        
        if (lineUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: '沒有已註冊的Line用戶',
                notified: 0
            });
        }
        
        // 檢查每個用戶的加班資格
        const eligibleUsers = [];
        
        for (const user of lineUsers) {
            const isEligible = await checkOvertimeEligibility(
                user.selectedName!,
                user.selectedTeam!,
                user.selectedRole!,
                requesterName,
                requesterTeam,
                date,
                overtimeType,
                halfType
            );
            
            if (isEligible.eligible) {
                eligibleUsers.push({
                    lineUserId: user.lineUserId,
                    memberName: user.selectedName,
                    team: user.selectedTeam,
                    role: user.selectedRole,
                    reason: isEligible.reason
                });
            }
        }
        
        // 發送通知給符合資格的用戶
        let notifiedCount = 0;
        for (const user of eligibleUsers) {
            try {
                const opportunity = {
                    record: leaveRecord,
                    reason: user.reason
                };
                
                await sendOvertimeNotification(user.lineUserId, {
                    requesterName: leaveRecord.requesterName,
                    requesterTeam: leaveRecord.requesterTeam,
                    date: leaveRecord.date,
                    period: '全天',
                    suggestedTeam: user.memberName,
                    reason: user.reason || '需要加班支援'
                });
                
                notifiedCount++;
            } catch (error) {
                console.error(`通知用戶 ${user.memberName} 失敗:`, error);
            }
        }
        
        return NextResponse.json({
            success: true,
            message: '加班機會通知發送完成',
            totalEligible: eligibleUsers.length,
            notified: notifiedCount,
            eligibleUsers: eligibleUsers.map(u => ({
                memberName: u.memberName,
                team: u.team,
                role: u.role,
                reason: u.reason
            }))
        });
        
    } catch (error) {
        console.error('發送加班機會通知失敗:', error);
        return NextResponse.json(
            { error: '發送通知失敗' },
            { status: 500 }
        );
    }
}

/**
 * DELETE - 通知加班機會已取消
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const {
            date,
            requesterName,
            requesterTeam,
            reason = '請假已取消或加班需求已滿足',
            excludeNames = [] // 新增：需要排除的人員名單
        } = body;
        
        if (!date || !requesterName || !requesterTeam) {
            return NextResponse.json(
                { error: '缺少必要欄位' },
                { status: 400 }
            );
        }
        
        // 查找所有已選擇名稱的Line用戶
        const lineUsers = await LineUserState.find({
            step: 'name_selected',
            selectedName: { $exists: true }
        });
        
        if (lineUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: '沒有已註冊的Line用戶',
                notified: 0
            });
        }
        
        // 使用新的排除功能發送取消通知
        const { sendOvertimeCancelledNotificationExcluding } = await import('@/services/lineBot');

        const result = await sendOvertimeCancelledNotificationExcluding(
            {
                date,
                requesterName,
                requesterTeam,
                reason
            },
            excludeNames
        );
        
        return NextResponse.json({
            success: true,
            message: '加班取消通知發送完成',
            notified: result.success,
            failed: result.failed,
            excluded: result.excluded,
            excludedNames: excludeNames
        });
        
    } catch (error) {
        console.error('發送加班取消通知失敗:', error);
        return NextResponse.json(
            { error: '發送通知失敗' },
            { status: 500 }
        );
    }
}

/**
 * 檢查加班資格
 */
async function checkOvertimeEligibility(
    memberName: string,
    memberTeam: string,
    memberRole: string,
    requesterName: string,
    requesterTeam: string,
    date: string,
    overtimeType?: string,
    halfType?: string
): Promise<{ eligible: boolean; reason?: string }> {
    try {
        // 不能為自己加班
        if (memberName === requesterName) {
            return { eligible: false };
        }
        
        // 不能為同班同事加班（除非特殊情況）
        if (memberTeam === requesterTeam) {
            return { eligible: false };
        }
        
        // 檢查該員工當天的班別
        const memberShift = getShiftForDate(new Date(date), memberTeam);
        
        // 大休班級優先有加班資格
        if (memberShift === '大休') {
            return {
                eligible: true,
                reason: `您的${memberTeam}班當天大休，可協助${requesterTeam}班加班`
            };
        }
        
        // 小休班級也可能有加班資格
        if (memberShift === '小休') {
            return {
                eligible: true,
                reason: `您的${memberTeam}班當天小休，可協助${requesterTeam}班加班`
            };
        }
        
        // 其他情況下，根據班別和角色判斷
        // 這裡可以添加更複雜的邏輯
        
        return { eligible: false };
        
    } catch (error) {
        console.error('檢查加班資格失敗:', error);
        return { eligible: false };
    }
}

/**
 * GET - 獲取當前的加班機會列表
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const memberName = searchParams.get('memberName');
        const team = searchParams.get('team');
        
        if (!memberName || !team) {
            return NextResponse.json(
                { error: '請提供員工姓名和班級' },
                { status: 400 }
            );
        }
        
        // 查找未來7天的請假記錄，看是否有適合的加班機會
        const today = new Date();
        const upcomingDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            upcomingDates.push(date.toISOString().split('T')[0]);
        }
        
        const leaveRecords = await LeaveRecord.find({
            date: { $in: upcomingDates },
            team: { $ne: team }, // 排除同班
            $or: [
                { 'fullDayOvertime.fullDayMember': { $exists: false } },
                { 'fullDayOvertime.firstHalfMember': { $exists: false } },
                { 'fullDayOvertime.secondHalfMember': { $exists: false } },
                { 'fullDayOvertime.fullDayMember.confirmed': false },
                { 'fullDayOvertime.firstHalfMember.confirmed': false },
                { 'fullDayOvertime.secondHalfMember.confirmed': false }
            ]
        });
        
        const opportunities = [];
        
        for (const record of leaveRecords) {
            const eligibility = await checkOvertimeEligibility(
                memberName,
                team,
                '', // role not needed for this check
                record.name,
                record.team,
                record.date
            );
            
            if (eligibility.eligible) {
                opportunities.push({
                    recordId: record._id,
                    date: record.date,
                    requesterName: record.name,
                    requesterTeam: record.team,
                    period: record.period,
                    reason: eligibility.reason
                });
            }
        }
        
        return NextResponse.json({
            success: true,
            memberName,
            team,
            opportunities,
            total: opportunities.length
        });
        
    } catch (error) {
        console.error('獲取加班機會失敗:', error);
        return NextResponse.json(
            { error: '獲取加班機會失敗' },
            { status: 500 }
        );
    }
}
