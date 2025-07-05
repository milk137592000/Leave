import { Client, Message, TextMessage, FlexMessage, QuickReply, QuickReplyItem, PostbackAction } from '@line/bot-sdk';

// LINE Bot 客戶端配置
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// 創建 LINE Bot 客戶端
const client = new Client(config);

export interface OvertimeNotification {
    requesterName: string;
    requesterTeam: string;
    date: string;
    period: string;
    suggestedTeam: string;
    reason: string;
}

export interface ProxyLeaveNotification {
    proxyByName: string;
    proxyByDisplayName: string;
    targetMemberName: string;
    date: string;
    period: 'fullDay' | { type: 'custom'; startTime: string; endTime: string; };
}

export interface ProxyCancelNotification {
    cancelledByName: string;
    cancelledByDisplayName: string;
    targetMemberName: string;
    date: string;
    period: 'fullDay' | { type: 'custom'; startTime: string; endTime: string; };
    reason?: string;
}

/**
 * 發送加班通知給指定的 LINE 用戶
 */
export async function sendOvertimeNotification(
    lineUserId: string,
    notification: OvertimeNotification
): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: createOvertimeMessage(notification)
        };

        await client.pushMessage(lineUserId, message);
        console.log(`加班通知已發送給用戶: ${lineUserId}`);
        return true;
    } catch (error) {
        console.error('發送 LINE 訊息失敗:', error);
        return false;
    }
}

/**
 * 批量發送加班通知給多個用戶
 */
export async function sendOvertimeNotificationToMultiple(
    lineUserIds: string[],
    notification: OvertimeNotification
): Promise<{ success: string[], failed: string[] }> {
    const results = {
        success: [] as string[],
        failed: [] as string[]
    };

    for (const userId of lineUserIds) {
        const success = await sendOvertimeNotification(userId, notification);
        if (success) {
            results.success.push(userId);
        } else {
            results.failed.push(userId);
        }
    }

    return results;
}

/**
 * 創建加班通知訊息內容
 */
function createOvertimeMessage(notification: OvertimeNotification): string {
    const { requesterName, requesterTeam, date, period, suggestedTeam, reason } = notification;

    // 構建加班頁面網址
    const overtimeUrl = `https://leave-ten.vercel.app/leave/${date}`;

    return `🔔 加班通知

📅 日期：${date}
👤 請假人員：${requesterTeam}班 ${requesterName}
⏰ 時段：${period}

💼 建議加班班級：${suggestedTeam}班
📝 原因：${reason}

🌐 點擊前往加班頁面：
${overtimeUrl}

如果您可以協助加班，請聯繫相關負責人。
感謝您的配合！`;
}

/**
 * 發送測試訊息
 */
export async function sendTestMessage(lineUserId: string): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: '🎉 LINE 連動測試成功！\n您已成功設定身份，將會收到相關的加班通知。'
        };

        await client.pushMessage(lineUserId, message);
        return true;
    } catch (error) {
        console.error('發送測試訊息失敗:', error);
        return false;
    }
}

/**
 * 用戶狀態管理
 */
export interface UserState {
    step: 'waiting_name_selection' | 'name_selected' | 'completed';
    selectedName?: string;
    selectedTeam?: string;
    selectedRole?: string;
}

/**
 * 獲取用戶狀態
 */
export async function getUserState(userId: string): Promise<UserState> {
    try {
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: LineUserState } = await import('@/models/LineUserState');

        await connectDB();

        const userState = await LineUserState.findOne({ lineUserId: userId });

        if (!userState) {
            return { step: 'waiting_name_selection' };
        }

        // 更新最後活動時間
        userState.lastActivity = new Date();
        await userState.save();

        return {
            step: userState.step,
            selectedName: userState.selectedName,
            selectedTeam: userState.selectedTeam,
            selectedRole: userState.selectedRole
        };
    } catch (error) {
        console.error('獲取用戶狀態失敗:', error);
        return { step: 'waiting_name_selection' };
    }
}

/**
 * 設置用戶狀態
 */
export async function setUserState(userId: string, state: UserState): Promise<void> {
    try {
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: LineUserState } = await import('@/models/LineUserState');

        await connectDB();

        await LineUserState.findOneAndUpdate(
            { lineUserId: userId },
            {
                ...state,
                lastActivity: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );
    } catch (error) {
        console.error('設置用戶狀態失敗:', error);
    }
}

/**
 * 清除用戶狀態
 */
export async function clearUserState(userId: string): Promise<void> {
    try {
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: LineUserState } = await import('@/models/LineUserState');

        await connectDB();

        await LineUserState.deleteOne({ lineUserId: userId });
    } catch (error) {
        console.error('清除用戶狀態失敗:', error);
    }
}

/**
 * 創建名稱選擇的快速回覆選單
 */
export function createNameSelectionQuickReply(): QuickReply {
    // 從teams.ts獲取所有員工名稱
    const allNames = [
        // A班
        '小雞', '竣', '宇', '耀', '馬', '哲', '允', '泰',
        // B班
        '隆', '廷', '堃', '惟', '樑', '瑋', '獻', '昌',
        // C班
        '誠', '銘', '麟', '弘', '佳', '毅', '鈞', '昇',
        // D班
        '永', '元', '加', '良', '瑄', '科', '琮', '翌'
    ];

    const quickReplyItems: QuickReplyItem[] = allNames.map(name => ({
        type: 'action',
        action: {
            type: 'postback',
            label: name,
            data: `action=select_name&name=${name}`
        }
    }));

    return {
        items: quickReplyItems
    };
}

/**
 * 發送名稱選擇訊息
 */
export async function sendNameSelectionMessage(lineUserId: string): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: '請選擇您的名稱：',
            quickReply: createNameSelectionQuickReply()
        };

        await client.pushMessage(lineUserId, message);

        // 設置用戶狀態
        setUserState(lineUserId, { step: 'waiting_name_selection' });

        return true;
    } catch (error) {
        console.error('發送名稱選擇訊息失敗:', error);
        return false;
    }
}

/**
 * 處理名稱選擇
 */
export async function handleNameSelection(lineUserId: string, selectedName: string): Promise<boolean> {
    try {
        // 驗證名稱是否存在於輪值表中
        const { isValid, team, role } = await validateMemberName(selectedName);

        if (!isValid) {
            const message: TextMessage = {
                type: 'text',
                text: `抱歉，找不到名稱「${selectedName}」在輪值表中。請重新選擇。`,
                quickReply: createNameSelectionQuickReply()
            };
            await client.pushMessage(lineUserId, message);
            return false;
        }

        // 更新用戶狀態
        setUserState(lineUserId, {
            step: 'name_selected',
            selectedName,
            selectedTeam: team,
            selectedRole: role
        });

        // 發送確認訊息
        const confirmMessage: TextMessage = {
            type: 'text',
            text: `✅ 已選擇：${selectedName} (${team}班 ${role})\n\n您現在會收到相關的加班通知。如需重新選擇，請輸入「重新選擇」。`
        };

        await client.pushMessage(lineUserId, confirmMessage);

        // 檢查是否有當前的加班機會
        await checkAndNotifyOvertimeOpportunities(lineUserId, selectedName, team!, role!);

        return true;
    } catch (error) {
        console.error('處理名稱選擇失敗:', error);
        return false;
    }
}

/**
 * 驗證成員名稱是否存在於輪值表中
 */
async function validateMemberName(name: string): Promise<{ isValid: boolean; team?: string; role?: string }> {
    // 導入teams數據
    const { getTeamsForDate } = await import('@/data/teams');

    // 使用當前日期獲取teams配置
    const currentDate = new Date().toISOString().split('T')[0];
    const teams = getTeamsForDate(currentDate);

    for (const [teamKey, teamData] of Object.entries(teams)) {
        const member = teamData.members.find(m => m.name === name);
        if (member) {
            return {
                isValid: true,
                team: teamKey,
                role: member.role
            };
        }
    }

    return { isValid: false };
}

/**
 * 檢查並通知當前的加班機會
 */
async function checkAndNotifyOvertimeOpportunities(
    lineUserId: string,
    memberName: string,
    team: string,
    role: string
): Promise<void> {
    try {
        // 導入必要的模組
        const { default: connectDB } = await import('@/lib/mongodb');
        const { LeaveRecord } = await import('@/models/LeaveRecord');

        await connectDB();

        // 查找當前未確認的加班機會
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // 查找今天和未來幾天的請假記錄，看是否有適合的加班機會
        const upcomingDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            upcomingDates.push(date.toISOString().split('T')[0]);
        }

        const leaveRecords = await LeaveRecord.find({
            date: { $in: upcomingDates },
            $or: [
                // 查找需要加班但還沒有人確認的記錄
                { 'fullDayOvertime.fullDayMember': { $exists: false } },
                { 'fullDayOvertime.firstHalfMember': { $exists: false } },
                { 'fullDayOvertime.secondHalfMember': { $exists: false } },
                { 'fullDayOvertime.fullDayMember.confirmed': false },
                { 'fullDayOvertime.firstHalfMember.confirmed': false },
                { 'fullDayOvertime.secondHalfMember.confirmed': false }
            ]
        });

        if (leaveRecords.length === 0) {
            return;
        }

        // 檢查該員工是否符合加班資格
        const eligibleOpportunities = await checkOvertimeEligibility(
            memberName,
            team,
            role,
            leaveRecords
        );

        if (eligibleOpportunities.length > 0) {
            await sendOvertimeOpportunityNotification(lineUserId, memberName, eligibleOpportunities);
        }

    } catch (error) {
        console.error('檢查加班機會失敗:', error);
    }
}

/**
 * 檢查加班資格
 */
async function checkOvertimeEligibility(
    memberName: string,
    team: string,
    role: string,
    leaveRecords: any[]
): Promise<any[]> {
    const eligibleOpportunities = [];

    for (const record of leaveRecords) {
        const { date, name: leaveMemberName, team: leaveTeam } = record;

        // 不能為自己的請假加班
        if (leaveMemberName === memberName) {
            continue;
        }

        // 不能為同班同事加班（除非特殊情況）
        if (leaveTeam === team) {
            continue;
        }

        // 檢查班別限制
        const { getShiftForDate } = await import('@/utils/schedule');
        const memberShift = getShiftForDate(new Date(date), team);

        // 如果該員工當天是大休，則有加班資格
        if (memberShift === '大休') {
            eligibleOpportunities.push({
                record,
                reason: `您的班級當天大休，可協助${leaveTeam}班加班`
            });
            continue;
        }

        // 如果該員工當天是小休，也可能有加班資格
        if (memberShift === '小休') {
            eligibleOpportunities.push({
                record,
                reason: `您的班級當天小休，可協助${leaveTeam}班加班`
            });
            continue;
        }

        // 其他班別也可能有加班資格，但優先級較低
        // 班長有更高的加班資格
        if (role === '班長') {
            eligibleOpportunities.push({
                record,
                reason: `您是${team}班班長，可協助${leaveTeam}班加班`
            });
            continue;
        }

        // 一般班員也可以加班，但需要根據班別判斷
        if (memberShift === '中班' || memberShift === '夜班' || memberShift === '早班') {
            eligibleOpportunities.push({
                record,
                reason: `您的${team}班當天${memberShift}，可協助${leaveTeam}班加班`
            });
            continue;
        }
    }

    return eligibleOpportunities;
}

/**
 * 發送加班機會通知
 */
async function sendOvertimeOpportunityNotification(
    lineUserId: string,
    memberName: string,
    opportunities: any[]
): Promise<void> {
    try {
        let messageText = `🔔 ${memberName}，您有以下加班機會：\n\n`;

        opportunities.forEach((opp, index) => {
            const { record, reason } = opp;
            const overtimeUrl = `https://leave-ten.vercel.app/leave/${record.date}`;

            messageText += `${index + 1}. 📅 ${record.date}\n`;
            messageText += `   👤 ${record.team}班 ${record.name} 請假\n`;
            messageText += `   💼 ${reason}\n`;
            messageText += `   🌐 加班頁面：${overtimeUrl}\n\n`;
        });

        messageText += '如果您願意加班，請聯繫相關負責人確認。';

        const message: TextMessage = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(lineUserId, message);

    } catch (error) {
        console.error('發送加班機會通知失敗:', error);
    }
}

/**
 * 發送加班機會消失通知
 */
export async function sendOvertimeCancelledNotification(
    lineUserId: string,
    memberName: string,
    cancelledOpportunity: {
        date: string;
        requesterName: string;
        requesterTeam: string;
        reason: string;
    }
): Promise<boolean> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: `❌ 加班機會已取消\n\n📅 日期：${cancelledOpportunity.date}\n👤 原請假人員：${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName}\n📝 取消原因：${cancelledOpportunity.reason}\n\n感謝您的關注！`
        };

        await client.pushMessage(lineUserId, message);
        return true;
    } catch (error) {
        console.error('發送加班取消通知失敗:', error);
        return false;
    }
}

/**
 * 批量發送加班機會消失通知，但排除特定人員
 */
export async function sendOvertimeCancelledNotificationExcluding(
    cancelledOpportunity: {
        date: string;
        requesterName: string;
        requesterTeam: string;
        reason: string;
    },
    excludeNames: string[] = []
): Promise<{ success: number; failed: number; excluded: number }> {
    try {
        // 導入必要的模組
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: UserProfile } = await import('@/models/UserProfile');
        const { default: LineUserState } = await import('@/models/LineUserState');

        await connectDB();

        // 查找所有已註冊的 LINE 用戶
        const [userProfiles, lineUsers] = await Promise.all([
            UserProfile.find({ notificationEnabled: true }),
            LineUserState.find({
                step: 'name_selected',
                selectedName: { $exists: true }
            })
        ]);

        console.log(`找到 UserProfile 用戶: ${userProfiles.length} 人`);
        console.log(`找到 LineUserState 用戶: ${lineUsers.length} 人`);

        // 合併用戶資料，優先使用 UserProfile
        const allUsers = new Map();

        // 先添加 UserProfile 的用戶
        userProfiles.forEach(user => {
            allUsers.set(user.lineUserId, {
                lineUserId: user.lineUserId,
                name: user.memberName, // 修正：使用 memberName 而不是 name
                team: user.team
            });
        });

        // 再添加 LineUserState 的用戶（如果不存在於 UserProfile 中）
        lineUsers.forEach(user => {
            if (!allUsers.has(user.lineUserId)) {
                allUsers.set(user.lineUserId, {
                    lineUserId: user.lineUserId,
                    name: user.selectedName,
                    team: user.selectedTeam
                });
            }
        });

        let successCount = 0;
        let failedCount = 0;
        let excludedCount = 0;

        // 將 Map.values() 轉換為數組來避免迭代器問題
        const userList = Array.from(allUsers.values());
        console.log(`合併後總用戶數: ${userList.length} 人`);

        for (const user of userList) {
            // 檢查是否需要排除此用戶
            if (excludeNames.includes(user.name)) {
                excludedCount++;
                console.log(`排除通知用戶: ${user.name} (${user.team}班)`);
                continue;
            }

            try {
                const success = await sendOvertimeCancelledNotification(
                    user.lineUserId,
                    user.name,
                    cancelledOpportunity
                );

                if (success) {
                    successCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                console.error(`發送通知給 ${user.name} 失敗:`, error);
                failedCount++;
            }
        }

        console.log(`加班取消通知發送完成 - 成功: ${successCount}, 失敗: ${failedCount}, 排除: ${excludedCount}`);

        return {
            success: successCount,
            failed: failedCount,
            excluded: excludedCount
        };

    } catch (error) {
        console.error('批量發送加班取消通知失敗:', error);
        return { success: 0, failed: 0, excluded: 0 };
    }
}

/**
 * 發送個人加班狀態查詢結果
 */
export async function sendPersonalOvertimeStatus(
    lineUserId: string,
    memberName: string,
    opportunities: any[]
): Promise<boolean> {
    try {
        let messageText = `📊 ${memberName} 的加班機會狀態\n\n`;

        if (opportunities.length === 0) {
            messageText += '目前沒有適合您的加班機會。\n\n';
        } else {
            messageText += `共有 ${opportunities.length} 個加班機會：\n\n`;

            opportunities.forEach((opp, index) => {
                const overtimeUrl = `https://leave-ten.vercel.app/leave/${opp.date}`;

                messageText += `${index + 1}. 📅 ${opp.date}\n`;
                messageText += `   👤 ${opp.requesterTeam}班 ${opp.requesterName}\n`;
                messageText += `   ⏰ ${opp.period}\n`;
                messageText += `   💼 ${opp.reason}\n`;
                messageText += `   🌐 加班頁面：${overtimeUrl}\n\n`;
            });
        }

        messageText += '如需更新資訊，請輸入「查詢加班」。';

        const message: TextMessage = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(lineUserId, message);
        return true;
    } catch (error) {
        console.error('發送個人加班狀態失敗:', error);
        return false;
    }
}

/**
 * 處理用戶指令
 */
export async function handleUserCommand(lineUserId: string, command: string): Promise<boolean> {
    try {
        const userState = await getUserState(lineUserId);

        switch (command.toLowerCase()) {
            case '查詢加班':
            case '加班機會':
                if (userState.selectedName && userState.selectedTeam) {
                    await queryPersonalOvertimeOpportunities(lineUserId, userState.selectedName, userState.selectedTeam);
                } else {
                    await sendNameSelectionMessage(lineUserId);
                }
                break;

            case '我的狀態':
            case '個人資訊':
                await sendPersonalInfo(lineUserId, userState);
                break;

            case '幫助':
            case 'help':
                await sendHelpMenu(lineUserId);
                break;

            case '重新選擇':
            case '更改名稱':
                await sendNameSelectionMessage(lineUserId);
                break;

            case '重新設定':
            case '重置身份':
            case '重新綁定':
            case '身份設定':
            case '設定身份':
                await handleIdentityReset(lineUserId);
                break;

            default:
                await sendUnknownCommandMessage(lineUserId);
                return false;
        }

        return true;
    } catch (error) {
        console.error('處理用戶指令失敗:', error);
        return false;
    }
}

/**
 * 處理身份重置
 */
async function handleIdentityReset(lineUserId: string): Promise<void> {
    try {
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: UserProfile } = await import('@/models/UserProfile');
        const { default: LineUserState } = await import('@/models/LineUserState');

        await connectDB();

        // 查找現有的用戶資料
        const existingProfile = await UserProfile.findOne({ lineUserId });

        // 刪除現有的用戶資料
        await UserProfile.findOneAndDelete({ lineUserId });
        await LineUserState.findOneAndDelete({ lineUserId });

        const liffUrl = `${process.env.NEXTAUTH_URL}/line-setup`;

        let message: TextMessage;

        if (existingProfile) {
            message = {
                type: 'text',
                text: `✅ 已重置您的身份設定！\n\n之前的身份：${existingProfile.team}班 ${existingProfile.role} ${existingProfile.memberName}\n\n請重新點擊以下連結設定身份：\n${liffUrl}\n\n設定完成後即可重新收到加班通知！`
            };
        } else {
            message = {
                type: 'text',
                text: `您尚未設定身份，請點擊以下連結進行設定：\n${liffUrl}\n\n設定完成後即可收到加班通知！`
            };
        }

        await client.pushMessage(lineUserId, message);

    } catch (error) {
        console.error('處理身份重置失敗:', error);
        const errorMessage: TextMessage = {
            type: 'text',
            text: '重置失敗，請稍後再試或聯繫管理員。'
        };
        await client.pushMessage(lineUserId, errorMessage);
    }
}

/**
 * 查詢個人加班機會
 */
async function queryPersonalOvertimeOpportunities(
    lineUserId: string,
    memberName: string,
    team: string
): Promise<void> {
    try {
        // 調用API查詢加班機會
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/overtime-opportunity?memberName=${encodeURIComponent(memberName)}&team=${encodeURIComponent(team)}`);

        if (response.ok) {
            const data = await response.json();
            await sendPersonalOvertimeStatus(lineUserId, memberName, data.opportunities || []);
        } else {
            throw new Error('查詢加班機會失敗');
        }
    } catch (error) {
        console.error('查詢個人加班機會失敗:', error);

        const message: TextMessage = {
            type: 'text',
            text: '抱歉，查詢加班機會時發生錯誤，請稍後再試。'
        };

        await client.pushMessage(lineUserId, message);
    }
}

/**
 * 發送個人資訊
 */
async function sendPersonalInfo(lineUserId: string, userState: UserState): Promise<void> {
    try {
        let messageText = '👤 您的個人資訊\n\n';

        if (userState.selectedName) {
            messageText += `姓名：${userState.selectedName}\n`;
            messageText += `班級：${userState.selectedTeam}班\n`;
            messageText += `職位：${userState.selectedRole}\n`;
            messageText += `狀態：已設定完成 ✅\n\n`;
            messageText += '您將會收到相關的加班通知。';
        } else {
            messageText += '您尚未設定個人資訊。\n\n';
            messageText += '請輸入「選擇名稱」開始設定。';
        }

        const message: TextMessage = {
            type: 'text',
            text: messageText
        };

        await client.pushMessage(lineUserId, message);
    } catch (error) {
        console.error('發送個人資訊失敗:', error);
    }
}

/**
 * 發送幫助選單
 */
async function sendHelpMenu(lineUserId: string): Promise<void> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: `📋 可用指令列表\n\n🔧 設定相關：\n• 選擇名稱 - 設定或更改您的身份\n• 重新選擇 - 重新選擇名稱\n• 我的狀態 - 查看個人資訊\n\n📊 查詢相關：\n• 查詢加班 - 查看可用的加班機會\n• 加班機會 - 同上\n\n❓ 其他：\n• 幫助 - 顯示此選單\n\n如有任何問題，請聯繫系統管理員。`
        };

        await client.pushMessage(lineUserId, message);
    } catch (error) {
        console.error('發送幫助選單失敗:', error);
    }
}

/**
 * 發送未知指令訊息
 */
async function sendUnknownCommandMessage(lineUserId: string): Promise<void> {
    try {
        const message: TextMessage = {
            type: 'text',
            text: '❓ 抱歉，我不理解這個指令。\n\n請輸入「幫助」查看可用指令列表。'
        };

        await client.pushMessage(lineUserId, message);
    } catch (error) {
        console.error('發送未知指令訊息失敗:', error);
    }
}

/**
 * 發送代理請假通知給被請假的人
 */
export async function sendProxyLeaveNotification(
    targetMemberName: string,
    notification: ProxyLeaveNotification
): Promise<boolean> {
    try {
        // 根據成員名稱查找對應的 LINE 用戶
        const connectDB = (await import('@/lib/mongodb')).default;
        const UserProfile = (await import('@/models/UserProfile')).default;

        await connectDB();

        const userProfile = await UserProfile.findOne({ memberName: targetMemberName });

        if (!userProfile) {
            console.log(`找不到成員 ${targetMemberName} 的 LINE 綁定資訊`);
            return false;
        }

        const message: TextMessage = {
            type: 'text',
            text: createProxyLeaveMessage(notification)
        };

        await client.pushMessage(userProfile.lineUserId, message);
        console.log(`代理請假通知已發送給 ${targetMemberName} (${userProfile.lineUserId})`);
        return true;
    } catch (error) {
        console.error('發送代理請假通知失敗:', error);
        return false;
    }
}

/**
 * 創建代理請假通知訊息
 */
function createProxyLeaveMessage(notification: ProxyLeaveNotification): string {
    const { proxyByName, proxyByDisplayName, targetMemberName, date, period } = notification;

    const formattedDate = new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    let periodText = '';
    if (period === 'fullDay') {
        periodText = '全天';
    } else if (typeof period === 'object' && period.type === 'custom') {
        periodText = `${period.startTime} - ${period.endTime}`;
    }

    return `📋 代理請假通知

${proxyByName} (${proxyByDisplayName}) 已為您申請請假：

📅 日期：${formattedDate}
⏰ 時段：${periodText}
👤 請假人：${targetMemberName}

如有疑問，請聯繫 ${proxyByName}。`;
}

/**
 * 發送代理取消請假通知給被取消請假的人
 */
export async function sendProxyCancelNotification(
    targetMemberName: string,
    notification: ProxyCancelNotification
): Promise<boolean> {
    try {
        // 根據成員名稱查找對應的 LINE 用戶
        const connectDB = (await import('@/lib/mongodb')).default;
        const UserProfile = (await import('@/models/UserProfile')).default;

        await connectDB();

        const userProfile = await UserProfile.findOne({ memberName: targetMemberName });

        if (!userProfile) {
            console.log(`找不到成員 ${targetMemberName} 的 LINE 綁定資訊`);
            return false;
        }

        const message: TextMessage = {
            type: 'text',
            text: createProxyCancelMessage(notification)
        };

        await client.pushMessage(userProfile.lineUserId, message);
        console.log(`代理取消請假通知已發送給 ${targetMemberName} (${userProfile.lineUserId})`);
        return true;
    } catch (error) {
        console.error('發送代理取消請假通知失敗:', error);
        return false;
    }
}

/**
 * 創建代理取消請假通知訊息
 */
function createProxyCancelMessage(notification: ProxyCancelNotification): string {
    const { cancelledByName, cancelledByDisplayName, targetMemberName, date, period, reason } = notification;

    const formattedDate = new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    let periodText = '';
    if (period === 'fullDay') {
        periodText = '全天';
    } else if (typeof period === 'object' && period.type === 'custom') {
        periodText = `${period.startTime} - ${period.endTime}`;
    }

    return `❌ 代理取消請假通知

${cancelledByName} (${cancelledByDisplayName}) 已為您取消請假申請：

📅 日期：${formattedDate}
⏰ 時段：${periodText}
👤 請假人：${targetMemberName}
${reason ? `📝 取消原因：${reason}` : ''}

如有疑問，請聯繫 ${cancelledByName}。`;
}

/**
 * 驗證 LINE Bot 配置
 */
export function validateLineConfig(): boolean {
    return !!(config.channelAccessToken && config.channelSecret);
}
