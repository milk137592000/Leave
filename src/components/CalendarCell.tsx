'use client';

import React from 'react';
import { format, parse } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { TEAMS } from '@/data/teams';
import { getShiftForDate, calculateTeamDeficit, getMemberRole, getMemberTeam, TEAM_START_POSITIONS } from '@/utils/schedule';
import type { LeaveRecord } from '@/types/LeaveRecord';
import type { DaySchedule, ShiftType } from '@/types/schedule';

interface CalendarCellProps {
    date: Date;
    shifts: DaySchedule['shifts'];
    selectedTeam?: string;
    isLeaveMode: boolean;
    leaveRecords: LeaveRecord[];
    onToggleLeave?: (date: Date) => void;
    isToday: boolean;
    lunarDate?: string;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
    date,
    shifts,
    selectedTeam,
    isLeaveMode,
    leaveRecords,
    onToggleLeave,
    isToday,
    lunarDate
}) => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    // 獲取當天的請假記錄
    const dayLeaveRecords = leaveRecords.filter(record => record.date === formattedDate);

    // 計算每個班級的差額
    const deficits = Object.keys(TEAMS)
        .filter(team => !selectedTeam || team === selectedTeam)
        .map(team => {
            const deficit = calculateTeamDeficit(team, date);
            return deficit;
        })
        .filter(Boolean);

    // 檢查是否為週六
    const isSaturday = date.getDay() === 6;

    // 檢查是否為過去日期（今天以前，今天不算過去）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const isPastDate = cellDate < today;

    const handleClick = () => {
        if (isPastDate) {
            return; // 過去日期不可點擊
        }
        if (onToggleLeave) {
            onToggleLeave(date);
        }
    };

    // 獲取當前選擇班級的班別
    const currentTeamShiftType = selectedTeam ? shifts[selectedTeam as keyof typeof shifts] : undefined;

    // 獲取班別的樣式
    const getShiftStyle = (shiftType: string) => {
        switch (shiftType) {
            case '大休':
            case '小休':
                return 'bg-red-700 text-white';
            case '早班':
                return 'bg-blue-600 text-white';
            case '中班':
                return 'bg-amber-700 text-white';
            case '夜班':
                return 'bg-gray-900 text-white';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    // 獲取當天的大休班級
    const getBigRestTeam = () => {
        for (const [team, shift] of Object.entries(shifts)) {
            if (shift === '大休') {
                return team;
            }
        }
        return null;
    };

    // Helper: 獲取請假人原始班別
    const getMemberOriginalShift = (memberName: string) => {
        const memberTeam = getMemberTeam(memberName); // 假設 getMemberTeam 已正確引入或定義
        return memberTeam ? shifts[memberTeam as keyof typeof shifts] : null;
    };

    // Helper: Find a team by a specific shift type for the current day
    const findTeamByShiftType = (targetShift: ShiftType): string | null => {
        for (const [team, shift] of Object.entries(shifts)) {
            if (shift === targetShift) {
                return team;
            }
        }
        return null;
    };

    // 獲取班級當天班別
    const getTeamShift = (team: string | undefined, currentDate: string): ShiftType | null => {
        if (!team) return null;
        return getShiftForDate(new Date(currentDate), team);
    };



    // 獲取半天加班建議（與請假頁面邏輯一致）
    const getHalfDayOvertimeSuggestions = (team: string | undefined, date: string): { firstHalf: string; secondHalf: string } => {
        if (!team) return { firstHalf: '', secondHalf: '' };

        const shift = getTeamShift(team, date);
        if (!shift || shift === '小休' || shift === '大休') return { firstHalf: '', secondHalf: '' };

        // 取得 cyclePosition
        const startDate = new Date('2025/04/01');
        const targetDate = new Date(date);
        const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const startPos = TEAM_START_POSITIONS[team];
        const cyclePosition = ((startPos + daysDiff) % 8 + 8) % 8;

        // 使用與請假頁面相同的邏輯
        const getCurrentTeam = (targetShift: ShiftType): string | null => {
            for (const [teamKey] of Object.entries(TEAMS)) {
                const teamShift = getShiftForDate(new Date(date), teamKey);
                if (teamShift === targetShift) {
                    return teamKey;
                }
            }
            return null;
        };

        const getPreviousTeam = (targetShift: ShiftType): string | null => {
            const prevDate = new Date(targetDate);
            prevDate.setDate(prevDate.getDate() - 1);
            for (const [teamKey] of Object.entries(TEAMS)) {
                const teamShift = getShiftForDate(prevDate, teamKey);
                if (teamShift === targetShift) {
                    return teamKey;
                }
            }
            return null;
        };

        const getRestTeam = (restType: '小休' | '大休'): string | null => {
            for (const [teamKey] of Object.entries(TEAMS)) {
                const teamShift = getShiftForDate(new Date(date), teamKey);
                if (teamShift === restType) {
                    return teamKey;
                }
            }
            return null;
        };

        const todayZhong = getCurrentTeam('中班') || '';
        const todayYe = getCurrentTeam('夜班') || '';
        const todayZao = getCurrentTeam('早班') || '';
        const todayXiaoXiu = getRestTeam('小休') || '';
        const prevZao = getPreviousTeam('早班') || '';
        const prevZhong = getPreviousTeam('中班') || '';

        let firstHalfSuggestion = '';
        let secondHalfSuggestion = '';

        switch (shift) {
            case '早班':
                // 早班1: cyclePosition==1，早班2: cyclePosition==2
                firstHalfSuggestion = todayZhong;
                if (cyclePosition === 1) {
                    secondHalfSuggestion = todayXiaoXiu;
                } else {
                    secondHalfSuggestion = todayYe;
                }
                break;
            case '中班':
                // 中班1: cyclePosition==3， 中班2: cyclePosition==4
                firstHalfSuggestion = todayZao;
                if (cyclePosition === 3) {
                    secondHalfSuggestion = todayXiaoXiu;
                } else {
                    secondHalfSuggestion = todayYe;
                }
                break;
            case '夜班':
                // 夜班: cyclePosition==6 or 7
                firstHalfSuggestion = prevZao;
                secondHalfSuggestion = prevZhong;
                break;
        }

        return {
            firstHalf: firstHalfSuggestion ? `${firstHalfSuggestion}班` : '無建議',
            secondHalf: secondHalfSuggestion ? `${secondHalfSuggestion}班` : '無建議'
        };
    };

    // 獲取自定義時段的加班建議
    const getCustomOvertimeSuggestion = (startTime: string, endTime: string, team: string | null, date: string): string | null => {
        if (!team) return null;

        const shift = getTeamShift(team, date);
        if (!shift) return null;

        // 確保時間格式一致 (把 "08:15" 轉換為 "0815")
        const formattedStartTime = startTime.replace(':', '');
        const formattedEndTime = endTime.replace(':', '');

        const startTimeInt = parseInt(formattedStartTime);
        const endTimeInt = parseInt(formattedEndTime);

        // 獲取班次時間
        const getShiftStartTime = (shift: ShiftType): number => {
            switch (shift) {
                case '早班': return 815;
                case '中班': return 1615;
                case '夜班': return 2315;
                default: return 0;
            }
        };

        const getShiftEndTime = (shift: ShiftType): number => {
            switch (shift) {
                case '早班': return 1615;
                case '中班': return 2315;
                case '夜班': return 815;
                default: return 0;
            }
        };

        const getPreviousShift = (shift: ShiftType): ShiftType => {
            const shiftOrder: ShiftType[] = ['早班', '中班', '夜班'];
            const currentIndex = shiftOrder.indexOf(shift);
            return shiftOrder[(currentIndex - 1 + shiftOrder.length) % shiftOrder.length] as ShiftType;
        };

        const getNextShift = (shift: ShiftType): ShiftType => {
            const shiftOrder: ShiftType[] = ['早班', '中班', '夜班'];
            const currentIndex = shiftOrder.indexOf(shift);
            return shiftOrder[(currentIndex + 1) % shiftOrder.length] as ShiftType;
        };

        // 獲取指定班別的班級代號
        const getTeamByShift = (targetShift: ShiftType, date: string): string | null => {
            for (const [teamKey] of Object.entries(TEAMS)) {
                const teamShift = getShiftForDate(new Date(date), teamKey);
                if (teamShift === targetShift) {
                    return teamKey;
                }
            }
            return null;
        };

        // 檢查是否與上一班結束時間重疊
        const previousShiftEndTime = getShiftEndTime(getPreviousShift(shift));
        if (startTimeInt === previousShiftEndTime) {
            return getTeamByShift(getPreviousShift(shift), date);
        }

        // 檢查是否與下一班開始時間重疊
        const nextShiftStartTime = getShiftStartTime(getNextShift(shift));
        if (endTimeInt === nextShiftStartTime) {
            return getTeamByShift(getNextShift(shift), date);
        }

        return null;
    };

    // 獲取建議加班班級
    const getSuggestedOvertimeTeams = (record: LeaveRecord) => {
        const suggestions = new Set<string>();
        const leaverOriginalTeam = getMemberTeam(record.name);
        const memberOriginalShift = getMemberOriginalShift(record.name);

        const detailedLog = record.date === '2025-05-13' || record.date === '2025-05-17' || record.date === '2025-05-20' || record.date === '2025-05-24';

        if (detailedLog) {
            console.log(`[getSuggestedOvertimeTeams DETAILED TRACE] Record: ${record.name} (Leaver Original Team: ${leaverOriginalTeam || 'N/A'}), Date: ${record.date}, Leaver Original Shift (on this date): ${memberOriginalShift || 'N/A'}`);
        }

        const addSuggestion = (suggestedTeam: string | null | undefined, half: 'FH' | 'SH' | 'FullDay' | 'Custom' | 'BigRest') => {
            if (detailedLog) {
                console.log(`  [${half}] Attempting to suggest: '${suggestedTeam}'. Leaver's team: '${leaverOriginalTeam}'. Rule: suggestedTeam && suggestedTeam !== leaverOriginalTeam.`);
            }
            if (suggestedTeam && suggestedTeam !== leaverOriginalTeam) {
                suggestions.add(suggestedTeam);
                if (detailedLog) {
                    console.log(`    [${half}] Added '${suggestedTeam}' to suggestions.`);
                }
            } else if (detailedLog) {
                if (!suggestedTeam) {
                    console.log(`    [${half}] Did not add: Suggested team is null/undefined.`);
                } else if (suggestedTeam === leaverOriginalTeam) {
                    console.log(`    [${half}] Did not add: Suggested team '${suggestedTeam}' is leaver's own team.`);
                }
            }
        };

        if (record.period === 'fullDay' && record.fullDayOvertime) {
            if (record.fullDayOvertime.type === '加一半') {
                // First Half
                const fhProvidedTeam = record.fullDayOvertime.firstHalfMember?.team;
                const fhConfirmed = record.fullDayOvertime.firstHalfMember?.confirmed || false;
                if (detailedLog) {
                    console.log(`  [FH] Provided Info: .team='${fhProvidedTeam || 'empty'}', .confirmed=${fhConfirmed}`);
                }

                if (!fhConfirmed) {
                    let teamToSuggest1: string | null = null;
                    if (fhProvidedTeam) {
                        teamToSuggest1 = fhProvidedTeam;
                        if (detailedLog) console.log(`  [FH] Using provided .team field: '${teamToSuggest1}'.`);
                        addSuggestion(teamToSuggest1, 'FH');
                    } else {
                        // 先添加大休班級建議（如果存在且不是禮拜二）
                        const bigRestTeam = getBigRestTeam();
                        const isTuesday = date.getDay() === 2; // 0=週日, 1=週一, 2=週二...
                        if (bigRestTeam && !isTuesday) {
                            addSuggestion(bigRestTeam, 'FH');
                            if (detailedLog) console.log(`  [FH] Added big rest team: '${bigRestTeam}'.`);
                        } else if (bigRestTeam && isTuesday) {
                            if (detailedLog) console.log(`  [FH] Big rest team '${bigRestTeam}' not suggested (Tuesday restriction).`);
                        }

                        // 然後添加原有邏輯的建議
                        if (memberOriginalShift) {
                            if (memberOriginalShift === '早班') teamToSuggest1 = findTeamByShiftType('中班');
                            else if (memberOriginalShift === '中班') teamToSuggest1 = findTeamByShiftType('早班');
                            else if (memberOriginalShift === '夜班') teamToSuggest1 = findTeamByShiftType('早班'); // Simplified: current day's early shift as stand-in
                            if (detailedLog) console.log(`  [FH] Original logic suggestion for '${memberOriginalShift}' leaver: '${teamToSuggest1 || 'None found'}'.`);
                            addSuggestion(teamToSuggest1, 'FH');
                        }
                    }
                } else if (detailedLog) {
                    console.log(`  [FH] Slot is confirmed. No suggestion needed.`);
                }

                // Second Half
                const shProvidedTeam = record.fullDayOvertime.secondHalfMember?.team;
                const shConfirmed = record.fullDayOvertime.secondHalfMember?.confirmed || false;
                if (detailedLog) {
                    console.log(`  [SH] Provided Info: .team='${shProvidedTeam || 'empty'}', .confirmed=${shConfirmed}`);
                }

                if (!shConfirmed) {
                    let teamToSuggest2: string | null = null;
                    if (shProvidedTeam) {
                        teamToSuggest2 = shProvidedTeam;
                        if (detailedLog) console.log(`  [SH] Using provided .team field: '${teamToSuggest2}'.`);
                        addSuggestion(teamToSuggest2, 'SH');
                    } else {
                        // 先添加大休班級建議（如果存在且不是禮拜二）
                        const bigRestTeam = getBigRestTeam();
                        const isTuesday = date.getDay() === 2; // 0=週日, 1=週一, 2=週二...
                        if (bigRestTeam && !isTuesday) {
                            addSuggestion(bigRestTeam, 'SH');
                            if (detailedLog) console.log(`  [SH] Added big rest team: '${bigRestTeam}'.`);
                        } else if (bigRestTeam && isTuesday) {
                            if (detailedLog) console.log(`  [SH] Big rest team '${bigRestTeam}' not suggested (Tuesday restriction).`);
                        }

                        // 然後添加原有邏輯的建議
                        if (memberOriginalShift) {
                            if (memberOriginalShift === '早班') {
                                teamToSuggest2 = findTeamByShiftType('小休');
                                if (!teamToSuggest2) teamToSuggest2 = findTeamByShiftType('夜班');
                            } else if (memberOriginalShift === '中班') {
                                teamToSuggest2 = findTeamByShiftType('小休');
                                if (!teamToSuggest2) teamToSuggest2 = findTeamByShiftType('夜班');
                            } else if (memberOriginalShift === '夜班') {
                                teamToSuggest2 = findTeamByShiftType('中班'); // Simplified: current day's mid shift as stand-in
                            }
                            if (detailedLog) console.log(`  [SH] Original logic suggestion for '${memberOriginalShift}' leaver: '${teamToSuggest2 || 'None found'}'.`);
                            addSuggestion(teamToSuggest2, 'SH');
                        }
                    }
                } else if (detailedLog) {
                    console.log(`  [SH] Slot is confirmed. No suggestion needed.`);
                }
            } else if (record.fullDayOvertime.type === '加整班') {
                const fullDayProvidedTeam = record.fullDayOvertime.fullDayMember?.team;
                const fullDayConfirmed = record.fullDayOvertime.fullDayMember?.confirmed || false;
                if (detailedLog) {
                    console.log(`  [FullDay] Provided Info: .team='${fullDayProvidedTeam || 'empty'}', .confirmed=${fullDayConfirmed}`);
                }
                if (!fullDayConfirmed) {
                    let teamToSuggestFull: string | null = null;
                    if (fullDayProvidedTeam) {
                        teamToSuggestFull = fullDayProvidedTeam;
                        if (detailedLog) console.log(`  [FullDay] Using provided .team field: '${teamToSuggestFull}'.`);
                    } else {
                        const bigRestTeam = getBigRestTeam();
                        const isTuesday = date.getDay() === 2; // 0=週日, 1=週一, 2=週二...
                        if (bigRestTeam && !isTuesday) {
                            teamToSuggestFull = bigRestTeam; // Fallback to big rest team
                            if (detailedLog) console.log(`  [FullDay] .team field empty. Derived suggestion (big rest): '${teamToSuggestFull}'.`);
                        } else if (bigRestTeam && isTuesday) {
                            teamToSuggestFull = null; // Big rest team cannot work on Tuesday
                            if (detailedLog) console.log(`  [FullDay] Big rest team '${bigRestTeam}' not suggested (Tuesday restriction).`);
                        } else {
                            teamToSuggestFull = null;
                            if (detailedLog) console.log(`  [FullDay] No big rest team found.`);
                        }
                    }
                    addSuggestion(teamToSuggestFull, 'FullDay');
                } else if (detailedLog) {
                    console.log(`  [FullDay] Slot is confirmed. No suggestion needed.`);
                }
            }
        } else if (typeof record.period === 'object' && record.period.type === 'custom' && record.customOvertime) {
            const customProvidedTeam = record.customOvertime.team;
            const customConfirmed = record.customOvertime.confirmed || false;
            if (detailedLog) {
                console.log(`  [Custom] Provided Info: .team='${customProvidedTeam || 'empty'}', .confirmed=${customConfirmed}`);
            }
            if (!customConfirmed) {
                if (customProvidedTeam) { // For custom, we only use provided team currently
                    addSuggestion(customProvidedTeam, 'Custom');
                } else if (detailedLog) {
                    console.log(`  [Custom] .team field empty. No derivation logic for custom overtime suggestions currently.`);
                }
            } else if (detailedLog) {
                console.log(`  [Custom] Slot is confirmed. No suggestion needed.`);
            }
        } else {
            // 對於沒有設置加班記錄的請假，提供默認建議
            if (record.period === 'fullDay') {
                // 檢查當天是否有大休的班級
                let bigRestTeam = null;
                for (const [teamKey] of Object.entries(TEAMS)) {
                    const teamShift = getShiftForDate(new Date(record.date), teamKey);
                    if (teamShift === '大休') {
                        bigRestTeam = teamKey;
                        break;
                    }
                }

                // 如果有大休班級，添加大休班級建議（但禮拜二不得加班）
                if (bigRestTeam) {
                    const isTuesday = date.getDay() === 2; // 0=週日, 1=週一, 2=週二...
                    if (!isTuesday) {
                        addSuggestion(bigRestTeam, 'BigRest');
                        if (detailedLog) {
                            console.log(`  [BigRest Default] Added suggestion '${bigRestTeam}' for full day leave (big rest team)`);
                        }
                    } else {
                        if (detailedLog) {
                            console.log(`  [BigRest Default] Big rest team '${bigRestTeam}' not suggested (Tuesday restriction)`);
                        }
                    }
                }

                // 同時計算拆班加班建議（與大休建議並存）
                const halfDaySuggestions = getHalfDayOvertimeSuggestions(leaverOriginalTeam || undefined, record.date);
                if (halfDaySuggestions.firstHalf && halfDaySuggestions.firstHalf !== '無建議') {
                    const firstTeam = halfDaySuggestions.firstHalf.replace('班', '');
                    addSuggestion(firstTeam, 'FH');
                }
                if (halfDaySuggestions.secondHalf && halfDaySuggestions.secondHalf !== '無建議') {
                    const secondTeam = halfDaySuggestions.secondHalf.replace('班', '');
                    addSuggestion(secondTeam, 'SH');
                }
            } else if (typeof record.period === 'object' && record.period.type === 'custom') {
                // 對於自定義時段的請假，提供加班建議
                const customSuggestion = getCustomOvertimeSuggestion(record.period.startTime, record.period.endTime, leaverOriginalTeam, record.date);
                if (customSuggestion && customSuggestion !== leaverOriginalTeam) {
                    addSuggestion(customSuggestion, 'Custom');
                    if (detailedLog) {
                        console.log(`  [Custom Default] Added suggestion '${customSuggestion}' for custom period ${record.period.startTime}-${record.period.endTime}`);
                    }
                }
            }
        }

        if (detailedLog) {
            console.log(`  [getSuggestedOvertimeTeams DETAILED TRACE] Final suggestions for ${record.name} on ${record.date}: [${Array.from(suggestions).join(', ')}]`);
            console.log(`  --------------------`);
        }
        return Array.from(suggestions);
    };

    // Helper function to get deficit label for the current team
    const getDeficitLabelForTeam = (
        record: LeaveRecord,
        currentSelectedTeam: string | undefined,
        // allShiftsOnDate: DaySchedule['shifts'], // Already available as 'shifts' prop
        getLeaverOriginalShift: (memberName: string) => string | null,
        getBigRestTeamOnDate: () => string | null
    ): string => {
        if (!currentSelectedTeam) return "";

        const leaverName = record.name;
        const leaverOriginalTeam = getMemberTeam(leaverName);

        if (currentSelectedTeam === leaverOriginalTeam) return ""; // Don't show for leaver's own team calendar

        const overtime = record.fullDayOvertime;
        const customO = record.customOvertime;

        if (record.period === 'fullDay' && overtime) {
            const leaverShiftToday = getLeaverOriginalShift(leaverName);

            if (overtime.type === '加一半') {
                // First Half
                if (!overtime.firstHalfMember?.confirmed) {
                    let isRelevant = false;
                    if (overtime.firstHalfMember?.team === currentSelectedTeam) {
                        isRelevant = true;
                    } else if (!overtime.firstHalfMember?.team && leaverShiftToday) {
                        let suggestedFH = null;
                        if (leaverShiftToday === '早班') suggestedFH = findTeamByShiftType('中班');
                        else if (leaverShiftToday === '中班') suggestedFH = findTeamByShiftType('早班');
                        else if (leaverShiftToday === '夜班') suggestedFH = findTeamByShiftType('早班');
                        if (suggestedFH === currentSelectedTeam) isRelevant = true;
                    }
                    if (isRelevant) return ` (前半缺)`;
                }

                // Second Half (only if first half was not relevant or was filled)
                if (!overtime.secondHalfMember?.confirmed) {
                    let isRelevant = false;
                    if (overtime.secondHalfMember?.team === currentSelectedTeam) {
                        isRelevant = true;
                    } else if (!overtime.secondHalfMember?.team && leaverShiftToday) {
                        let suggestedSH = null;
                        if (leaverShiftToday === '早班') {
                            suggestedSH = findTeamByShiftType('小休');
                            if (!suggestedSH) suggestedSH = findTeamByShiftType('夜班');
                        } else if (leaverShiftToday === '中班') {
                            suggestedSH = findTeamByShiftType('小休');
                            if (!suggestedSH) suggestedSH = findTeamByShiftType('夜班');
                        } else if (leaverShiftToday === '夜班') {
                            suggestedSH = findTeamByShiftType('中班');
                        }
                        if (suggestedSH === currentSelectedTeam) isRelevant = true;
                    }
                    // Important: Ensure this deficit applies if the first half didn't return a label for this team.
                    if (isRelevant) return ` (後半缺)`;
                }
            } else if (overtime.type === '加整班') {
                if (!overtime.fullDayMember?.confirmed) {
                    let isRelevant = false;
                    if (overtime.fullDayMember?.team === currentSelectedTeam) {
                        isRelevant = true;
                    } else if (!overtime.fullDayMember?.team) {
                        const bigRestTeam = getBigRestTeamOnDate();
                        if (bigRestTeam === currentSelectedTeam) isRelevant = true;
                    }
                    if (isRelevant) return ` (全日缺)`;
                }
            }
        }
        // Custom overtime
        else if (typeof record.period === 'object' && record.period.type === 'custom' && customO) {
            if (!customO.confirmed && customO.team === currentSelectedTeam && currentSelectedTeam !== leaverOriginalTeam) {
                return ` (時段缺)`;
            }
        }
        return "";
    };

    // 判斷是否應該顯示請假記錄
    const shouldShowLeaveRecord = (record: LeaveRecord) => {
        // 請假日曆：顯示所有請假記錄
        if (isLeaveMode) return true;

        // 綜合輪班日曆（所有班別）：不顯示請假記錄，只顯示班表
        if (!selectedTeam) return false;

        // 各班輪班日曆：顯示該班可以加班的請假記錄

        const leaverTeam = getMemberTeam(record.name);

        // 檢查是否為系統建議的加班班級
        const suggestedTeams = getSuggestedOvertimeTeams(record);
        const isSuggestedTeam = suggestedTeams.includes(selectedTeam);

        // 檢查當前班別是否已經有成員確認了加班
        const hasCurrentTeamConfirmedOvertime = () => {
            // 檢查全天加班
            if (record.fullDayOvertime) {
                if (record.fullDayOvertime.type === '加整班' &&
                    record.fullDayOvertime.fullDayMember?.confirmed &&
                    record.fullDayOvertime.fullDayMember.team === selectedTeam) {
                    return true;
                }
                if (record.fullDayOvertime.type === '加一半') {
                    if ((record.fullDayOvertime.firstHalfMember?.confirmed &&
                         record.fullDayOvertime.firstHalfMember.team === selectedTeam) ||
                        (record.fullDayOvertime.secondHalfMember?.confirmed &&
                         record.fullDayOvertime.secondHalfMember.team === selectedTeam)) {
                        return true;
                    }
                }
            }
            // 檢查自定義時段加班
            if (record.customOvertime?.confirmed && record.customOvertime.team === selectedTeam) {
                return true;
            }
            return false;
        };

        // 如果當前班別已經有成員確認了加班，則不顯示該請假記錄
        if (hasCurrentTeamConfirmedOvertime()) {
            return false;
        }

        // 如果是請假人員自己的班別，且不是系統建議的加班班級，則不顯示
        if (leaverTeam === selectedTeam && !isSuggestedTeam) {
            return false;
        }

        // 1. 已指定本班加班且未確認的記錄
        if (record.period === 'fullDay' && record.fullDayOvertime) {
            if (record.fullDayOvertime.type === '加整班' &&
                record.fullDayOvertime.fullDayMember?.team === selectedTeam &&
                !record.fullDayOvertime.fullDayMember?.confirmed) {
                return true;
            }
            if (record.fullDayOvertime.type === '加一半') {
                if (record.fullDayOvertime.firstHalfMember?.team === selectedTeam &&
                    !record.fullDayOvertime.firstHalfMember?.confirmed) {
                    return true;
                }
                if (record.fullDayOvertime.secondHalfMember?.team === selectedTeam &&
                    !record.fullDayOvertime.secondHalfMember?.confirmed) {
                    return true;
                }
            }
        }

        // 2. 自定義時段且指定本班且未確認
        if (typeof record.period === 'object' && record.period.type === 'custom' &&
            record.customOvertime?.team === selectedTeam &&
            !record.customOvertime?.confirmed) {
            return true;
        }

        // 3. 系統建議本班加班的記錄
        if (suggestedTeams.includes(selectedTeam)) {
            // 對於全天假，如果還沒有設置 fullDayOvertime 或者未確認，則顯示
            if (record.period === 'fullDay') {
                if (!record.fullDayOvertime) {
                    return true; // 還沒有設置加班人員，顯示建議
                }
                if (record.fullDayOvertime.type === '加整班' && !record.fullDayOvertime.fullDayMember?.confirmed) {
                    return true;
                }
                if (record.fullDayOvertime.type === '加一半') {
                    if (!record.fullDayOvertime.firstHalfMember?.confirmed || !record.fullDayOvertime.secondHalfMember?.confirmed) {
                        return true;
                    }
                }
            }
            // 對於自定義時段，如果還沒有設置 customOvertime 或者未確認，則顯示
            if (typeof record.period === 'object' && record.period.type === 'custom') {
                if (!record.customOvertime || !record.customOvertime.confirmed) {
                    return true;
                }
            }
        }

        return false;
    };



    return (
        <div
            className={`relative p-2 h-32 border border-gray-200 ${isToday ? 'border-blue-500' : ''}
                ${isPastDate
                    ? 'cursor-not-allowed opacity-50 bg-gray-50'
                    : 'cursor-pointer hover:bg-gray-50'
                }`}
            onClick={handleClick}
        >
            <div className="text-sm font-medium flex justify-between items-center">
                <span className={isPastDate ? 'text-gray-400' : ''}>
                    {format(date, 'd', { locale: zhTW })}
                    {isPastDate && (
                        <span className="ml-1 text-xs text-gray-400">×</span>
                    )}
                </span>
                {isSaturday && deficits.length > 0 && (
                    <div className="text-[9px] bg-amber-800 text-white rounded-full px-2 py-0.5 whitespace-nowrap">
                        {deficits.map(d => d && d.replace('差額', '差')).join('、')}
                    </div>
                )}
            </div>

            {/* 顯示班別 */}
            {!isLeaveMode && (
                <div className="mt-2">
                    {selectedTeam ? (
                        currentTeamShiftType && (
                            <div className="flex flex-row justify-center items-center gap-1 w-full mt-1">
                                <span className={`inline-block text-[9px] px-1 py-0.5 whitespace-nowrap text-center ${getShiftStyle(currentTeamShiftType)}`}>{currentTeamShiftType}</span>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-row flex-wrap justify-center items-center gap-1 w-full mt-1">
                            {Object.entries(shifts).map(([team, type], index) => (
                                <span key={index} className={`inline-block text-[9px] px-1 py-0.5 whitespace-nowrap text-center ${getShiftStyle(type)}`}>{team}: {type}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 顯示請假記錄 */}
            {dayLeaveRecords.length > 0 && (
                <div className="flex flex-col justify-center items-center gap-1 w-full mt-1">
                    {dayLeaveRecords.map((record, index) => {
                        if (!shouldShowLeaveRecord(record)) {
                            return null;
                        }

                        const deficitLabel = getDeficitLabelForTeam(
                            record,
                            selectedTeam,
                            getMemberOriginalShift,
                            getBigRestTeam
                        );

                        // 檢查加班是否已完成 (Restoring original logic for styling)
                        const isFullDayOvertimeComplete = record.fullDayOvertime?.type === '加整班'
                            ? record.fullDayOvertime.fullDayMember?.confirmed
                            : record.fullDayOvertime?.type === '加一半' &&
                            record.fullDayOvertime.firstHalfMember?.confirmed &&
                            record.fullDayOvertime.secondHalfMember?.confirmed;
                        const hasConfirmedCustomOvertime = record.customOvertime?.confirmed;
                        const isConfirmed = isFullDayOvertimeComplete || hasConfirmedCustomOvertime;

                        // 根據角色和狀態設置樣式 (Restoring original logic for styling)
                        const role = getMemberRole(record.name);
                        let tagClass = '';

                        if (isPastDate) {
                            tagClass = 'bg-gray-100 text-gray-400';
                        } else if (isConfirmed) {
                            tagClass = 'bg-gray-200 text-gray-500';
                        } else if (role === '班長') {
                            tagClass = 'bg-red-100 text-red-700';
                        } else {
                            tagClass = 'bg-blue-100 text-blue-700';
                        }

                        // 根據請假記錄數量調整字體大小 (Restoring original logic for styling)
                        const fontSizeClass = dayLeaveRecords.length > 4
                            ? 'text-[7px]'
                            : 'text-[9px]';

                        return (
                            <div
                                key={`${record._id || record.name}-${index}`} // Using new key format is fine
                                className={`flex items-center gap-1 ${tagClass} ${fontSizeClass} px-1 py-0.5 rounded whitespace-nowrap cursor-pointer hover:opacity-80`} // Restored classes
                                onClick={(e) => { // Restored onClick
                                    e.stopPropagation();
                                    if (!isPastDate && onToggleLeave) {
                                        onToggleLeave(date);
                                    }
                                }}
                                title={`${record.name} (${typeof record.period === 'object' ? `${format(parse(record.period.startTime, 'HH:mm', new Date()), 'HH:mm')} - ${format(parse(record.period.endTime, 'HH:mm', new Date()), 'HH:mm')}` : '全天'})${deficitLabel}`} // deficitLabel in title
                            >
                                {record.name}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 農曆日期 */}
            {lunarDate && (
                <div className="text-xs text-gray-500 text-center mt-1">
                    {lunarDate}
                </div>
            )}
        </div>
    );
};

export default CalendarCell; 