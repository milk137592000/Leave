export interface TeamMember {
    name: string;
    role: '班長' | '班員';
}

export interface Team {
    members: TeamMember[];
}

// 7/13之前的配置
const TEAMS_BEFORE_713: Record<string, Team> = {
    'A': {
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '耀', role: '班員' },
            { name: '馬', role: '班員' },
            { name: 'A-1', role: '班員' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' }
        ]
    },
    'B': {
        members: [
            { name: '隆', role: '班長' },
            { name: '廷', role: '班長' },
            { name: '順', role: '班長' },
            { name: '惟', role: '班員' },
            { name: 'B-1', role: '班員' },
            { name: '瑋', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '堃', role: '班員' }
        ]
    },
    'C': {
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '昌', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' }
        ]
    },
    'D': {
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '良', role: '班員' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '琮', role: '班員' },
            { name: '翌', role: '班員' }
        ]
    }
};

// 7/13之後的配置
const TEAMS_AFTER_713: Record<string, Team> = {
    'A': {
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '耀', role: '班員' },
            { name: '馬', role: '班員' },
            { name: '哲', role: '班員' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' }
        ]
    },
    'B': {
        members: [
            { name: '隆', role: '班長' },
            { name: '廷', role: '班長' },
            { name: '順', role: '班長' },
            { name: '堃', role: '班長' },
            { name: '惟', role: '班員' },
            { name: '樑', role: '班員' },
            { name: '瑋', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '昌', role: '班員' }
        ]
    },
    'C': {
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' },
            { name: '昇', role: '班員' }
        ]
    },
    'D': {
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '良', role: '班員' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '琮', role: '班員' },
            { name: '翌', role: '班員' }
        ]
    }
};

// 7/15之後的配置（順退休）
const TEAMS_AFTER_715: Record<string, Team> = {
    'A': {
        members: [
            { name: '小雞', role: '班長' },
            { name: '竣', role: '班長' },
            { name: '宇', role: '班長' },
            { name: '耀', role: '班員' },
            { name: '馬', role: '班員' },
            { name: '哲', role: '班員' },
            { name: '允', role: '班員' },
            { name: '泰', role: '班員' }
        ]
    },
    'B': {
        members: [
            { name: '隆', role: '班長' },
            { name: '廷', role: '班長' },
            { name: '堃', role: '班長' },
            { name: '惟', role: '班員' },
            { name: '樑', role: '班員' },
            { name: '瑋', role: '班員' },
            { name: '獻', role: '班員' },
            { name: '昌', role: '班員' }
        ]
    },
    'C': {
        members: [
            { name: '誠', role: '班長' },
            { name: '銘', role: '班長' },
            { name: '麟', role: '班長' },
            { name: '弘', role: '班員' },
            { name: '佳', role: '班員' },
            { name: '毅', role: '班員' },
            { name: '鈞', role: '班員' },
            { name: '昇', role: '班員' }
        ]
    },
    'D': {
        members: [
            { name: '永', role: '班長' },
            { name: '元', role: '班長' },
            { name: '加', role: '班長' },
            { name: '良', role: '班員' },
            { name: '瑄', role: '班員' },
            { name: '科', role: '班員' },
            { name: '琮', role: '班員' },
            { name: '翌', role: '班員' }
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