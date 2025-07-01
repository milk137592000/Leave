'use client';

import { useEffect, useState } from 'react';
import { getTeamsForDate } from '@/data/teams';

declare global {
    interface Window {
        liff: any;
    }
}

interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
}

interface UserProfile {
    lineUserId: string;
    displayName: string;
    team: string;
    role: '班長' | '班員';
    memberName: string;
    notificationEnabled: boolean;
}

export default function LineSetupPage() {
    const [isLiffReady, setIsLiffReady] = useState(false);
    const [liffProfile, setLiffProfile] = useState<LiffProfile | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedRole, setSelectedRole] = useState<'班長' | '班員' | ''>('');
    const [selectedMember, setSelectedMember] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const teams = getTeamsForDate(new Date());

    useEffect(() => {
        initializeLiff();
    }, []);

    const initializeLiff = async () => {
        try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (!liffId) {
                setError('LIFF ID 未設定');
                return;
            }

            // 動態載入 LIFF SDK
            const script = document.createElement('script');
            script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
            script.onload = async () => {
                try {
                    await window.liff.init({ liffId });
                    setIsLiffReady(true);

                    if (window.liff.isLoggedIn()) {
                        const profile = await window.liff.getProfile();
                        setLiffProfile(profile);
                        await checkExistingProfile(profile.userId);
                    } else {
                        window.liff.login();
                    }
                } catch (error) {
                    console.error('LIFF 初始化失敗:', error);
                    setError('LIFF 初始化失敗');
                }
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('載入 LIFF SDK 失敗:', error);
            setError('載入 LIFF SDK 失敗');
        }
    };

    const checkExistingProfile = async (lineUserId: string) => {
        try {
            const response = await fetch(`/api/user-profile?lineUserId=${lineUserId}`);
            const data = await response.json();

            if (data.exists) {
                setUserProfile(data.profile);
                setSuccess(true);
            }
        } catch (error) {
            console.error('檢查用戶資料失敗:', error);
        }
    };

    const handleTeamChange = (team: string) => {
        setSelectedTeam(team);
        setSelectedRole('');
        setSelectedMember('');
    };

    const handleRoleChange = (role: '班長' | '班員') => {
        setSelectedRole(role);
        setSelectedMember('');
    };

    const getAvailableMembers = () => {
        if (!selectedTeam || !selectedRole) return [];
        return teams[selectedTeam]?.members.filter(member => member.role === selectedRole) || [];
    };

    const handleSubmit = async () => {
        if (!liffProfile || !selectedTeam || !selectedRole || !selectedMember) {
            setError('請完整填寫所有欄位');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/user-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineUserId: liffProfile.userId,
                    displayName: liffProfile.displayName,
                    pictureUrl: liffProfile.pictureUrl,
                    team: selectedTeam,
                    role: selectedRole,
                    memberName: selectedMember
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserProfile(data.profile);
                setSuccess(true);
            } else {
                setError(data.error || '設定失敗');
            }
        } catch (error) {
            console.error('提交失敗:', error);
            setError('網路錯誤，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    if (!isLiffReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">正在初始化 LINE 登入...</p>
                </div>
            </div>
        );
    }

    if (success && userProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">設定完成！</h2>
                        <p className="text-gray-600 mb-4">您的身份已成功設定</p>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">身份資訊：</p>
                            <p className="font-medium">{userProfile.team}班 {userProfile.role} {userProfile.memberName}</p>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-4">
                            當有加班需求時，系統會自動發送 LINE 訊息通知您。
                        </p>
                        
                        <button
                            onClick={() => window.liff.closeWindow()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            關閉視窗
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        設定您的身份
                    </h1>

                    {liffProfile && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">LINE 用戶：</p>
                            <p className="font-medium">{liffProfile.displayName}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* 選擇班級 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                選擇班級
                            </label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => handleTeamChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">請選擇班級</option>
                                {Object.keys(teams).map(team => (
                                    <option key={team} value={team}>{team}班</option>
                                ))}
                            </select>
                        </div>

                        {/* 選擇角色 */}
                        {selectedTeam && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    選擇角色
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleChange(e.target.value as '班長' | '班員')}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">請選擇角色</option>
                                    <option value="班長">班長</option>
                                    <option value="班員">班員</option>
                                </select>
                            </div>
                        )}

                        {/* 選擇成員 */}
                        {selectedTeam && selectedRole && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    選擇您的姓名
                                </label>
                                <select
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">請選擇姓名</option>
                                    {getAvailableMembers().map(member => (
                                        <option key={member.name} value={member.name}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedTeam || !selectedRole || !selectedMember}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '設定中...' : '確認設定'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
