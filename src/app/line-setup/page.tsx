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
            let liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            console.log('環境變數 LIFF ID:', liffId); // 調試用

            // 如果環境變數未設定，使用硬編碼值
            if (!liffId || liffId.trim() === '') {
                liffId = '2007680034-QnRpBayW';
                console.log('使用硬編碼 LIFF ID:', liffId);
            }

            if (!liffId || liffId.trim() === '') {
                setError('LIFF ID 仍然無效');
                return;
            }

            // 動態載入 LIFF SDK
            const script = document.createElement('script');
            script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
            script.onload = async () => {
                try {
                    console.log('開始初始化 LIFF...'); // 調試用
                    await window.liff.init({ liffId });
                    console.log('LIFF 初始化成功'); // 調試用
                    setIsLiffReady(true);

                    if (window.liff.isLoggedIn()) {
                        console.log('用戶已登入'); // 調試用
                        const profile = await window.liff.getProfile();
                        console.log('用戶資料:', profile); // 調試用
                        setLiffProfile(profile);

                        // 檢查是否已有設定
                        await checkExistingProfile(profile.userId);
                        // 無論是否已設定，都讓用戶看到界面（已設定會顯示成功頁面，未設定會顯示選擇界面）
                    } else {
                        console.log('用戶未登入，需要先登入'); // 調試用
                        // 不自動登入，讓用戶手動點擊登入按鈕
                    }
                } catch (error) {
                    console.error('LIFF 初始化失敗:', error);
                    setError(`LIFF 初始化失敗: ${error instanceof Error ? error.message : String(error)}`);
                }
            };
            script.onerror = () => {
                console.error('載入 LIFF SDK 失敗');
                setError('載入 LIFF SDK 失敗');
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('載入 LIFF SDK 失敗:', error);
            setError(`載入 LIFF SDK 失敗: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const checkExistingProfile = async (lineUserId: string): Promise<boolean> => {
        try {
            console.log('檢查用戶資料:', lineUserId);
            const response = await fetch(`/api/user-profile?lineUserId=${lineUserId}`);
            const data = await response.json();
            console.log('用戶資料檢查結果:', data);

            if (data.exists && data.profile) {
                console.log('用戶已有設定，顯示成功頁面');
                setUserProfile(data.profile);
                setSuccess(true);
                return true;
            } else {
                console.log('用戶未設定，顯示選擇界面');
                setSuccess(false);
                return false;
            }
        } catch (error) {
            console.error('檢查用戶資料失敗:', error);
            setSuccess(false);
            return false;
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-red-600 font-medium mb-2">初始化失敗</div>
                            <p className="text-red-600 text-sm mb-4">{error}</p>
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <p>調試資訊：</p>
                                <p>LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '未設定'}</p>
                                <p>當前網址: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                重新載入
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">正在初始化 LINE 登入...</p>
                            <p className="mt-2 text-xs text-gray-400">LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '未設定'}</p>
                        </div>
                    )}
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

    // 如果 LIFF 未準備好，顯示載入中
    if (!isLiffReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-red-600 font-medium mb-2">初始化失敗</div>
                            <p className="text-red-600 text-sm mb-4">{error}</p>
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <p>調試資訊：</p>
                                <p>LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '未設定'}</p>
                                <p>當前網址: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                重新載入
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">正在初始化 LINE 登入...</p>
                            <p className="mt-2 text-xs text-gray-400">LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '未設定'}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 如果用戶已設定完成，顯示成功頁面
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

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ 身份一旦設定完成即無法更改，請確保資訊正確。
                            </p>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            當有加班需求時，系統會自動發送 LINE 訊息通知您。
                        </p>

                        <div className="space-y-2">
                            <button
                                onClick={() => window.liff.closeWindow()}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                關閉視窗
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 如果用戶未登入，顯示登入按鈕
    if (!liffProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-6">
                        LINE 身份設定
                    </h1>

                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-4">
                            請先登入您的 LINE 帳號，然後選擇您在輪值表中的身份。
                        </p>
                        <p className="text-sm text-gray-500">
                            設定完成後，您將會收到相關的加班通知。
                        </p>
                    </div>

                    <button
                        onClick={() => window.liff && window.liff.login()}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                        🔐 使用 LINE 登入
                    </button>

                    <p className="text-xs text-gray-400 mt-4">
                        點擊後將跳轉到 LINE 登入頁面
                    </p>
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

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">LINE 用戶：</p>
                        <p className="font-medium">{liffProfile.displayName}</p>
                        <p className="text-xs text-gray-500 mt-1">User ID: {liffProfile.userId}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="text-yellow-600 mr-2 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800 mb-1">重要提醒</h3>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• 身份一旦設定完成即無法更改</li>
                                    <li>• 每個輪值表成員只能綁定一個 LINE 帳號</li>
                                    <li>• 請確保選擇正確的班級、角色和姓名</li>
                                </ul>
                            </div>
                        </div>
                    </div>

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
