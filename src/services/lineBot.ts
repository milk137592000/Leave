import { Client, Message, TextMessage, FlexMessage, QuickReply, QuickReplyItem, PostbackAction, ClientConfig } from '@line/bot-sdk';

// 直接 LINE API 調用的備用方案
async function sendLineMessageDirect(lineUserId: string, message: string): Promise<boolean> {
    try {
        const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();

        if (!accessToken) {
            console.error('❌ LINE_CHANNEL_ACCESS_TOKEN 未設定');
            return false;
        }

        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: lineUserId,
                messages: [{
                    type: 'text',
                    text: message
                }]
            })
        });

        if (response.ok) {
            console.log('✅ 直接 LINE API 調用成功');
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ 直接 LINE API 調用失敗:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ 直接 LINE API 調用異常:', error);
        return false;
    }
}

// 安全的 LINE Bot 客戶端配置
function createSafeLineConfig(): ClientConfig {
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || '';
    const channelSecret = process.env.LINE_CHANNEL_SECRET?.trim() || '';

    return {
        channelAccessToken: accessToken,
        channelSecret: channelSecret,
    };
}

// 驗證 LINE Bot 配置
export function validateLineConfig(): boolean {
    const config = createSafeLineConfig();
    const hasAccessToken = !!config.channelAccessToken;
    const hasChannelSecret = !!config.channelSecret;

    if (!hasAccessToken) {
        console.error('❌ LINE_CHANNEL_ACCESS_TOKEN 未設定');
        return false;
    }

    if (!hasChannelSecret) {
        console.error('❌ LINE_CHANNEL_SECRET 未設定');
        return false;
    }

    // 檢查 token 格式
    if (config.channelAccessToken.length < 50) {
        console.error('❌ LINE_CHANNEL_ACCESS_TOKEN 格式可能不正確（長度太短）');
        return false;
    }

    console.log('✅ LINE Bot 配置驗證通過');
    return true;
}

// 創建 LINE Bot 客戶端（延遲初始化以避免 token 問題）
function createLineClient(): Client {
    const config = createSafeLineConfig();

    // 記錄配置資訊（不洩露完整 token）
    console.log(`🔧 創建 LINE Client - Token 長度: ${config.channelAccessToken.length}`);

    return new Client(config);
}

// 為了向後兼容，保留一個預設客戶端
const client = createLineClient();

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

export interface ProxyOvertimeNotification {
    proxyByName: string;
    proxyByDisplayName: string;
    targetMemberName: string;
    date: string;
    overtimeTime: string;
    overtimeType: string;
}

export interface ProxyOvertimeCancelNotification {
    cancelledByName: string;
    cancelledByDisplayName: string;
    targetMemberName: string;
    date: string;
    overtimeTime: string;
    overtimeType: string;
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

        // 首先嘗試使用 LINE SDK
        try {
            const client = createLineClient();
            await client.pushMessage(lineUserId, message);
            console.log(`加班通知已發送給用戶: ${lineUserId} (使用 SDK)`);
            return true;
        } catch (sdkError) {
            console.warn(`⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:`, sdkError);

            // 備用方案：直接調用 LINE API
            const directSuccess = await sendLineMessageDirect(lineUserId, message.text);
            if (directSuccess) {
                console.log(`加班通知已發送給用戶: ${lineUserId} (使用直接 API)`);
                return true;
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
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

    // 確保 suggestedTeam 是有效的班級名稱（A, B, C, D）
    const validTeams = ['A', 'B', 'C', 'D'];
    const isValidTeam = validTeams.includes(suggestedTeam);

    if (!isValidTeam) {
        console.warn(`⚠️  警告：suggestedTeam "${suggestedTeam}" 不是有效的班級名稱`);
    }

    return `🔔 加班通知

📅 日期：${date}
👤 請假人員：${requesterTeam}班 ${requesterName}
⏰ 時段：${period}

💼 建議加班班級：${isValidTeam ? suggestedTeam + '班' : suggestedTeam}
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

        // 首先嘗試使用 LINE SDK
        try {
            const client = createLineClient();
            await client.pushMessage(lineUserId, message);
            return true;
        } catch (sdkError) {
            console.warn(`⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:`, sdkError);

            // 備用方案：直接調用 LINE API
            const directSuccess = await sendLineMessageDirect(lineUserId, message.text);
            if (directSuccess) {
                return true;
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
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

        const client = createLineClient();
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
            const client = createLineClient();
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

        const client = createLineClient();
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

        // 如果該員工當天是大休，則有加班資格（但禮拜二除外）
        if (memberShift === '大休') {
            const isTuesday = new Date(date).getDay() === 2; // 0=週日, 1=週一, 2=週二...
            if (!isTuesday) {
                eligibleOpportunities.push({
                    record,
                    reason: `您的班級當天大休，可協助${leaveTeam}班加班`
                });
            } else {
                console.log(`⚠️  禮拜二限制：${team}班大休不得加班 (${date})`);
            }
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

        const client = createLineClient();
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
        console.log(`🔔 準備發送取消通知給 ${memberName} (${lineUserId})`);

        // 驗證 LINE Bot 配置
        if (!validateLineConfig()) {
            console.error('❌ LINE Bot 配置無效，跳過發送');
            return false;
        }

        // 驗證 lineUserId 格式
        if (!lineUserId || !lineUserId.startsWith('U')) {
            console.error(`❌ 無效的 LINE User ID: ${lineUserId}`);
            return false;
        }

        // 根據取消原因判斷是加班機會取消還是請假取消
        const isLeaveCancel = cancelledOpportunity.reason.includes('請假') ||
                             cancelledOpportunity.reason.includes('刪除') ||
                             cancelledOpportunity.reason.includes('取消');

        const title = isLeaveCancel ? '📢 請假取消通知' : '❌ 加班機會已取消';
        const content = isLeaveCancel ?
            `${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName} 的請假已取消` :
            `${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName} 的加班機會已取消`;

        const message: TextMessage = {
            type: 'text',
            text: `${title}\n\n📅 日期：${cancelledOpportunity.date}\n👤 人員：${cancelledOpportunity.requesterTeam}班 ${cancelledOpportunity.requesterName}\n📝 說明：${cancelledOpportunity.reason}\n\n${isLeaveCancel ? '原本的加班需求也一併取消。' : '感謝您的關注！'}`
        };

        console.log(`📤 發送訊息內容: ${message.text.substring(0, 100)}...`);

        // 首先嘗試使用 LINE SDK
        try {
            const client = createLineClient();
            await client.pushMessage(lineUserId, message);
            console.log(`✅ 取消通知發送成功給 ${memberName} (使用 SDK)`);
            return true;
        } catch (sdkError) {
            console.warn(`⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:`, sdkError);

            // 備用方案：直接調用 LINE API
            const directSuccess = await sendLineMessageDirect(lineUserId, message.text);
            if (directSuccess) {
                console.log(`✅ 取消通知發送成功給 ${memberName} (使用直接 API)`);
                return true;
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
    } catch (error) {
        console.error(`❌ 發送取消通知給 ${memberName} (${lineUserId}) 失敗:`, error);

        // 詳細錯誤資訊
        if (error && typeof error === 'object' && 'response' in error) {
            const lineError = error as any;
            console.error('LINE API 錯誤詳情:', {
                status: lineError.response?.status,
                statusText: lineError.response?.statusText,
                data: lineError.response?.data
            });
        }

        // 檢查是否是 Authorization header 問題
        if (error instanceof Error && error.message.includes('Invalid character in header')) {
            console.error('🚨 這是 LINE Channel Access Token 的格式問題！');
            console.error('💡 請檢查 LINE_CHANNEL_ACCESS_TOKEN 是否包含特殊字符');
            const safeConfig = createSafeLineConfig();
            console.error('💡 Token 預覽:', safeConfig.channelAccessToken.substring(0, 20) + '...');
        }

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
            console.log(`🔄 處理用戶: ${user.name} (${user.team}班, ${user.lineUserId})`);

            // 檢查是否需要排除此用戶
            if (excludeNames.includes(user.name)) {
                excludedCount++;
                console.log(`⏭️  排除通知用戶: ${user.name} (${user.team}班)`);
                continue;
            }

            try {
                console.log(`📤 嘗試發送通知給 ${user.name}...`);
                const success = await sendOvertimeCancelledNotification(
                    user.lineUserId,
                    user.name,
                    cancelledOpportunity
                );

                if (success) {
                    successCount++;
                    console.log(`✅ 通知發送成功: ${user.name}`);
                } else {
                    failedCount++;
                    console.log(`❌ 通知發送失敗: ${user.name}`);
                }
            } catch (error) {
                console.error(`💥 發送通知給 ${user.name} 時發生異常:`, error);
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
 * 直接發送加班機會通知（不通過HTTP API）
 */
export async function sendLineOvertimeOpportunityNotificationDirect(
    opportunity: {
        date: string;
        requesterName: string;
        requesterTeam: string;
        period: string;
        overtimeType: string;
        halfType?: string;
    }
): Promise<{ success: number; failed: number; total: number }> {
    try {
        console.log('開始直接發送加班機會通知:', opportunity);

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
                name: user.memberName,
                team: user.team,
                role: user.role
            });
        });

        // 再添加 LineUserState 的用戶（如果不存在於 UserProfile 中）
        lineUsers.forEach(user => {
            if (!allUsers.has(user.lineUserId)) {
                allUsers.set(user.lineUserId, {
                    lineUserId: user.lineUserId,
                    name: user.selectedName,
                    team: user.selectedTeam,
                    role: '班員' // 預設角色
                });
            }
        });

        let successCount = 0;
        let failedCount = 0;
        const userList = Array.from(allUsers.values());

        console.log(`合併後總用戶數: ${userList.length} 人`);

        // 檢查每個用戶的加班資格並發送通知
        for (const user of userList) {
            try {
                // 檢查加班資格
                const eligibility = await checkOvertimeEligibilityInternal(
                    user.name,
                    user.team,
                    user.role || '班員',
                    opportunity.requesterName,
                    opportunity.requesterTeam,
                    opportunity.date
                );

                if (eligibility.eligible) {
                    // 發送通知
                    const success = await sendOvertimeNotification(
                        user.lineUserId,
                        {
                            date: opportunity.date,
                            requesterName: opportunity.requesterName,
                            requesterTeam: opportunity.requesterTeam,
                            period: opportunity.period,
                            suggestedTeam: user.team,
                            reason: eligibility.reason || '有加班機會'
                        }
                    );

                    if (success) {
                        successCount++;
                        console.log(`✅ 通知發送成功: ${user.name} (${user.team}班)`);
                    } else {
                        failedCount++;
                        console.log(`❌ 通知發送失敗: ${user.name} (${user.team}班)`);
                    }
                } else {
                    console.log(`⏭️  跳過用戶: ${user.name} (${user.team}班) - 不符合資格`);
                }
            } catch (error) {
                console.error(`處理用戶 ${user.name} 時發生錯誤:`, error);
                failedCount++;
            }
        }

        const result = {
            success: successCount,
            failed: failedCount,
            total: userList.length
        };

        console.log('加班機會通知發送完成:', result);
        return result;

    } catch (error) {
        console.error('直接發送加班機會通知失敗:', error);
        return { success: 0, failed: 0, total: 0 };
    }
}

/**
 * 內部加班資格檢查函數
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

        // 不能為同班同事加班
        if (memberTeam === requesterTeam) {
            return { eligible: false };
        }

        // 檢查該員工當天的班別
        const { getShiftForDate } = await import('@/utils/schedule');
        const memberShift = getShiftForDate(new Date(date), memberTeam);

        // 大休班級優先有加班資格（但禮拜二除外）
        if (memberShift === '大休') {
            const isTuesday = new Date(date).getDay() === 2; // 0=週日, 1=週一, 2=週二...
            if (!isTuesday) {
                return {
                    eligible: true,
                    reason: `您的${memberTeam}班當天大休，可協助${requesterTeam}班加班`
                };
            } else {
                console.log(`⚠️  禮拜二限制：${memberTeam}班大休不得加班 (${date})`);
                return { eligible: false };
            }
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



/**
 * 發送代理加班通知給被填寫加班的人
 */
export async function sendProxyOvertimeNotification(
    targetMemberName: string,
    notification: ProxyOvertimeNotification
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
            text: createProxyOvertimeMessage(notification)
        };

        // 首先嘗試使用 LINE SDK
        try {
            const client = createLineClient();
            await client.pushMessage(userProfile.lineUserId, message);
            console.log(`✅ 代理加班通知發送成功給 ${targetMemberName} (使用 SDK)`);
            return true;
        } catch (sdkError) {
            console.warn(`⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:`, sdkError);

            // 備用方案：直接調用 LINE API
            const directSuccess = await sendLineMessageDirect(userProfile.lineUserId, message.text);
            if (directSuccess) {
                console.log(`✅ 代理加班通知發送成功給 ${targetMemberName} (使用直接 API)`);
                return true;
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
    } catch (error) {
        console.error(`❌ 發送代理加班通知給 ${targetMemberName} 失敗:`, error);
        return false;
    }
}

/**
 * 創建代理加班通知訊息
 */
function createProxyOvertimeMessage(notification: ProxyOvertimeNotification): string {
    const { proxyByName, proxyByDisplayName, targetMemberName, date, overtimeTime, overtimeType } = notification;

    const formattedDate = new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    return `🔔 代理加班通知

${proxyByName} (${proxyByDisplayName}) 已為您填寫加班：

📅 日期：${formattedDate}
⏰ 時段：${overtimeTime}
💼 類型：${overtimeType}
👤 加班人：${targetMemberName}

如有疑問，請聯繫 ${proxyByName}。`;
}

/**
 * 發送代理取消加班通知給被取消加班的人
 */
export async function sendProxyOvertimeCancelNotification(
    targetMemberName: string,
    notification: ProxyOvertimeCancelNotification
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
            text: createProxyOvertimeCancelMessage(notification)
        };

        // 首先嘗試使用 LINE SDK
        try {
            const client = createLineClient();
            await client.pushMessage(userProfile.lineUserId, message);
            console.log(`✅ 代理取消加班通知發送成功給 ${targetMemberName} (使用 SDK)`);
            return true;
        } catch (sdkError) {
            console.warn(`⚠️ LINE SDK 發送失敗，嘗試直接 API 調用:`, sdkError);

            // 備用方案：直接調用 LINE API
            const directSuccess = await sendLineMessageDirect(userProfile.lineUserId, message.text);
            if (directSuccess) {
                console.log(`✅ 代理取消加班通知發送成功給 ${targetMemberName} (使用直接 API)`);
                return true;
            } else {
                throw sdkError; // 如果直接 API 也失敗，拋出原始錯誤
            }
        }
    } catch (error) {
        console.error(`❌ 發送代理取消加班通知給 ${targetMemberName} 失敗:`, error);
        return false;
    }
}

/**
 * 創建代理取消加班通知訊息
 */
function createProxyOvertimeCancelMessage(notification: ProxyOvertimeCancelNotification): string {
    const { cancelledByName, cancelledByDisplayName, targetMemberName, date, overtimeTime, overtimeType, reason } = notification;

    const formattedDate = new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    return `❌ 代理取消加班通知

${cancelledByName} (${cancelledByDisplayName}) 已為您取消加班：

📅 日期：${formattedDate}
⏰ 時段：${overtimeTime}
💼 類型：${overtimeType}
👤 加班人：${targetMemberName}
${reason ? `📝 取消原因：${reason}` : ''}

如有疑問，請聯繫 ${cancelledByName}。`;
}
