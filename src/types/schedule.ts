export type ShiftType = '早班' | '中班' | '夜班' | '小休' | '大休';
export type MemberRole = '班長' | '班員';

export interface ShiftStyle {
    backgroundColor: string;
    textColor: string;
}

export interface TeamMember {
    name: string;
    role: MemberRole;
}

export interface Team {
    id: string;
    members: TeamMember[];
}

export interface ShiftEntry {
    type: ShiftType;
    team?: string;
    date: Date;
}

export interface LeaveRecord {
    date: string;
    name: string;
    confirmed?: boolean;
    fullDayOvertime?: {
        type: '加整班' | '加一半';
        fullDayMember?: {
            name: string;
            team: string;
            confirmed: boolean;
        };
        firstHalfMember?: {
            name: string;
            team: string;
            confirmed: boolean;
        };
        secondHalfMember?: {
            name: string;
            team: string;
            confirmed: boolean;
        };
    };
    customOvertime?: {
        name: string;
        team: string;
        startTime: string;
        endTime: string;
        confirmed: boolean;
    };
}

export interface DaySchedule {
    date: string;
    shifts: {
        A: ShiftType;
        B: ShiftType;
        C: ShiftType;
        D: ShiftType;
    };
    leaveRecords: string[];
    holidays: string[];
}

export const SHIFT_STYLES: Record<ShiftType, ShiftStyle> = {
    '早班': { backgroundColor: '#E3F2FD', textColor: '#1565C0' },
    '中班': { backgroundColor: '#FFF3E0', textColor: '#E65100' },
    '夜班': { backgroundColor: '#212121', textColor: 'white' },
    '小休': { backgroundColor: '#FFE4E4', textColor: '#D32F2F' },
    '大休': { backgroundColor: '#FFEBEE', textColor: '#C62828' },
};

// 7/13之前的配置
const TEAMS_BEFORE_713: Record<string, Team> = {
    'A': {
        id: 'A',
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' },
            { name: '耀', role: '班員' },
            { name: 'A-1', role: '班員' },
            { name: '馬', role: '班員' },
        ]
    },
    'B': {
        id: 'B',
        members: [
            { name: '隆', role: '班長' },
            { name: '貓', role: '班長' },
            { name: '順', role: '班長' },
            { name: '瑋', role: '班員' },
            { name: '廷', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '智', role: '班員' },
            { name: '惟', role: '班員' },
            { name: 'B-1', role: '班員' },
            { name: '堃', role: '班員' },
        ]
    },
    'C': {
        id: 'C',
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '昌', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' },
        ]
    },
    'D': {
        id: 'D',
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '良', role: '班員' },
            { name: '翌', role: '班員' },
            { name: '壬', role: '班員' },
        ]
    }
};

// 7/13之後的配置
const TEAMS_AFTER_713: Record<string, Team> = {
    'A': {
        id: 'A',
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '耀', role: '班員' },
            { name: '馬', role: '班員' },
            { name: '哲', role: '班員' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' },
        ]
    },
    'B': {
        id: 'B',
        members: [
            { name: '隆', role: '班長' },
            { name: '廷', role: '班長' },
            { name: '順', role: '班長' },
            { name: '堃', role: '班長' },
            { name: '惟', role: '班員' },
            { name: '樑', role: '班員' },
            { name: '瑋', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '昌', role: '班員' },
        ]
    },
    'C': {
        id: 'C',
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' },
            { name: '昇', role: '班員' },
        ]
    },
    'D': {
        id: 'D',
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '良', role: '班員' },
            { name: '翌', role: '班員' },
            { name: '壬', role: '班員' },
        ]
    }
};

// 7/15之後的配置（順退休）
const TEAMS_AFTER_715: Record<string, Team> = {
    'A': {
        id: 'A',
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '耀', role: '班員' },
            { name: '馬', role: '班員' },
            { name: '哲', role: '班員' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' },
        ]
    },
    'B': {
        id: 'B',
        members: [
            { name: '隆', role: '班長' },
            { name: '廷', role: '班長' },
            { name: '堃', role: '班長' },
            { name: '惟', role: '班員' },
            { name: '樑', role: '班員' },
            { name: '瑋', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '昌', role: '班員' },
        ]
    },
    'C': {
        id: 'C',
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' },
            { name: '昇', role: '班員' },
        ]
    },
    'D': {
        id: 'D',
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '良', role: '班員' },
            { name: '翌', role: '班員' },
            { name: '壬', role: '班員' },
        ]
    }
};

// 根據日期獲取對應的團隊配置
export const getTeamsForDate = (date: string | Date): Record<string, Team> => {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const changeDate713 = new Date('2025-07-13');
    const changeDate715 = new Date('2025-07-15');

    if (targetDate >= changeDate715) {
        return TEAMS_AFTER_715;
    } else if (targetDate >= changeDate713) {
        return TEAMS_AFTER_713;
    } else {
        return TEAMS_BEFORE_713;
    }
};

// 為了向後兼容，導出默認的 TEAMS（使用當前日期）
export const TEAMS = getTeamsForDate(new Date());

// 7/13之前的可請假人員列表
const LEAVE_MEMBERS_BEFORE_713 = [
    // B班
    { name: '隆', role: '班長' },
    { name: '貓', role: '班長' },
    { name: '順', role: '班長' },
    { name: '瑋', role: '班員' },
    { name: '廷', role: '班員' },
    { name: '獻', role: '班員' },
    { name: '智', role: '班員' },
    { name: '惟', role: '班員' },
    { name: 'B-1', role: '班員' },
    { name: '堃', role: '班員' },
    // C班
    { name: '誠', role: '班長' },
    { name: '銘', role: '班長' },
    { name: '麟', role: '班長' },
    { name: '弘', role: '班員' },
    { name: '佳', role: '班員' },
    { name: '昌', role: '班員' },
    { name: '毅', role: '班員' },
    { name: '鈞', role: '班員' },
];

// 7/13之後的可請假人員列表
const LEAVE_MEMBERS_AFTER_713 = [
    // B班
    { name: '隆', role: '班長' },
    { name: '廷', role: '班長' },
    { name: '順', role: '班長' },
    { name: '堃', role: '班長' },
    { name: '惟', role: '班員' },
    { name: '樑', role: '班員' },
    { name: '瑋', role: '班員' },
    { name: '獻', role: '班員' },
    { name: '昌', role: '班員' },
    // C班
    { name: '誠', role: '班長' },
    { name: '銘', role: '班長' },
    { name: '麟', role: '班長' },
    { name: '弘', role: '班員' },
    { name: '佳', role: '班員' },
    { name: '毅', role: '班員' },
    { name: '鈞', role: '班員' },
    { name: '昇', role: '班員' },
];

// 7/15之後的可請假人員列表（順退休）
const LEAVE_MEMBERS_AFTER_715 = [
    // B班
    { name: '隆', role: '班長' },
    { name: '廷', role: '班長' },
    { name: '堃', role: '班長' },
    { name: '惟', role: '班員' },
    { name: '樑', role: '班員' },
    { name: '瑋', role: '班員' },
    { name: '獻', role: '班員' },
    { name: '昌', role: '班員' },
    // C班
    { name: '誠', role: '班長' },
    { name: '銘', role: '班長' },
    { name: '麟', role: '班長' },
    { name: '弘', role: '班員' },
    { name: '佳', role: '班員' },
    { name: '毅', role: '班員' },
    { name: '鈞', role: '班員' },
    { name: '昇', role: '班員' },
];

// 根據日期獲取對應的可請假人員列表
export const getLeaveMembersForDate = (date: string | Date) => {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const changeDate713 = new Date('2025-07-13');
    const changeDate715 = new Date('2025-07-15');

    if (targetDate >= changeDate715) {
        return LEAVE_MEMBERS_AFTER_715;
    } else if (targetDate >= changeDate713) {
        return LEAVE_MEMBERS_AFTER_713;
    } else {
        return LEAVE_MEMBERS_BEFORE_713;
    }
};

// 為了向後兼容，導出默認的 LEAVE_MEMBERS（使用當前日期）
export const LEAVE_MEMBERS = getLeaveMembersForDate(new Date());

// 8天循環的班別順序
const SHIFT_CYCLE: ShiftType[] = [
    '早班', '早班',   // 早班連續2天
    '中班', '中班',   // 中班連續2天
    '小休',          // 小休1天
    '夜班', '夜班',   // 夜班連續2天
    '大休'           // 大休1天
];

// 班別排程表
export const SCHEDULES: Record<string, ShiftType[][]> = {
    'A': [
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
        ['夜班', '小休', '大休', '早班', '早班', '中班', '中班'],
        ['夜班', '小休', '大休', '早班', '早班', '中班', '中班'],
        ['中班', '中班', '夜班', '小休', '大休', '早班', '早班'],
    ],
    'B': [
        ['中班', '中班', '夜班', '小休', '大休', '早班', '早班'],
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
        ['夜班', '小休', '大休', '早班', '早班', '中班', '中班'],
    ],
    'C': [
        ['夜班', '小休', '大休', '早班', '早班', '中班', '中班'],
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
        ['中班', '中班', '夜班', '小休', '大休', '早班', '早班'],
        ['大休', '早班', '早班', '中班', '中班', '夜班', '小休'],
    ],
    'D': [
        ['大休', '早班', '早班', '中班', '中班', '夜班', '小休'],
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
        ['夜班', '小休', '大休', '早班', '早班', '中班', '中班'],
        ['早班', '早班', '中班', '中班', '夜班', '小休', '大休'],
    ],
}; 