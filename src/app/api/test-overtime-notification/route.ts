import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import { sendOvertimeNotification } from '@/services/lineBot';

/**
 * 測試加班通知API
 * 用於驗證修改後的通知邏輯是否正常工作
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { 
            testDate = '2025-07-06',
            requesterName = '瑋',
            requesterTeam = 'B',
            dryRun = true // 預設為測試模式，不實際發送通知
        } = body;
        
        console.log('🧪 開始測試加班通知邏輯');
        console.log(`📅 測試日期: ${testDate}`);
        console.log(`👤 請假人員: ${requesterTeam}班 ${requesterName}`);
        console.log(`🔧 測試模式: ${dryRun ? '是（不實際發送）' : '否（實際發送）'}`);
        
        // 查找所有已註冊的用戶
        const allUsers = await UserProfile.find({ notificationEnabled: true });
        console.log(`👥 找到 ${allUsers.length} 位已註冊用戶`);
        
        if (allUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: '沒有已註冊的用戶',
                results: []
            });
        }
        
        // 不需要動態導入，直接使用內部函數
        
        // 檢查每個用戶的加班資格
        const results = [];
        let eligibleCount = 0;
        let notificationsSent = 0;
        
        for (const user of allUsers) {
            try {
                // 使用內部函數檢查資格（需要模擬）
                const eligibility = await checkOvertimeEligibilityInternal(
                    user.memberName,
                    user.team,
                    user.role,
                    requesterName,
                    requesterTeam,
                    testDate
                );
                
                const result = {
                    memberName: user.memberName,
                    team: user.team,
                    role: user.role,
                    lineUserId: user.lineUserId,
                    eligible: eligibility.eligible,
                    reason: eligibility.reason || '不符合條件',
                    notificationSent: false
                };
                
                if (eligibility.eligible) {
                    eligibleCount++;
                    
                    // 如果不是測試模式，實際發送通知
                    if (!dryRun) {
                        try {
                            const notificationSuccess = await sendOvertimeNotification(user.lineUserId, {
                                requesterName,
                                requesterTeam,
                                date: testDate,
                                period: '全天',
                                suggestedTeam: user.memberName,
                                reason: eligibility.reason || '需要加班支援'
                            });
                            
                            result.notificationSent = notificationSuccess;
                            if (notificationSuccess) {
                                notificationsSent++;
                            }
                        } catch (error) {
                            console.error(`發送通知給 ${user.memberName} 失敗:`, error);
                            result.notificationSent = false;
                        }
                    }
                }
                
                results.push(result);
                
            } catch (error) {
                console.error(`檢查用戶 ${user.memberName} 資格失敗:`, error);
                results.push({
                    memberName: user.memberName,
                    team: user.team,
                    role: user.role,
                    lineUserId: user.lineUserId,
                    eligible: false,
                    reason: '檢查失敗',
                    notificationSent: false
                });
            }
        }
        
        // 特別檢查鈞的情況
        const junResult = results.find(r => r.memberName === '鈞');
        
        console.log(`📊 測試結果:`);
        console.log(`   總用戶數: ${allUsers.length}`);
        console.log(`   符合資格: ${eligibleCount}`);
        console.log(`   通知發送: ${notificationsSent}`);
        console.log(`   鈞的狀態: ${junResult ? (junResult.eligible ? '符合資格' : '不符合資格') : '未找到'}`);
        
        return NextResponse.json({
            success: true,
            message: '測試完成',
            testConfig: {
                testDate,
                requesterName,
                requesterTeam,
                dryRun
            },
            summary: {
                totalUsers: allUsers.length,
                eligibleUsers: eligibleCount,
                notificationsSent: notificationsSent
            },
            results: results,
            junStatus: junResult ? {
                eligible: junResult.eligible,
                reason: junResult.reason,
                notificationSent: junResult.notificationSent
            } : null
        });
        
    } catch (error) {
        console.error('測試加班通知失敗:', error);
        return NextResponse.json(
            {
                error: '測試失敗',
                details: error instanceof Error ? error.message : '未知錯誤'
            },
            { status: 500 }
        );
    }
}

/**
 * 內部加班資格檢查函數（複製自 overtime-opportunity/route.ts）
 */
async function checkOvertimeEligibilityInternal(
    memberName: string,
    memberTeam: string,
    memberRole: string,
    requesterName: string,
    requesterTeam: string,
    date: string
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
        const { getShiftForDate } = await import('@/utils/schedule');
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
        
        // 其他班別也可能有加班資格，但優先級較低
        // 中班、夜班、早班的員工也可以考慮加班，特別是班長
        if (memberRole === '班長') {
            return {
                eligible: true,
                reason: `您是${memberTeam}班班長，可協助${requesterTeam}班加班`
            };
        }
        
        // 一般班員也可以加班，但需要根據班別判斷
        if (memberShift === '中班' || memberShift === '夜班' || memberShift === '早班') {
            return {
                eligible: true,
                reason: `您的${memberTeam}班當天${memberShift}，可協助${requesterTeam}班加班`
            };
        }
        
        return { eligible: false };
        
    } catch (error) {
        console.error('檢查加班資格失敗:', error);
        return { eligible: false };
    }
}
