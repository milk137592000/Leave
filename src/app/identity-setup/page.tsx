'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamsForDate } from '@/data/teams';

export default function IdentitySetupPage() {
    const router = useRouter();
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // 模擬 LINE 用戶資料
    const mockLineProfile = {
        userId: 'test-user-123',
        displayName: '測試用戶',
        pictureUrl: ''
    };

    // 獲取今天的團隊資料
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const teams = getTeamsForDate(todayString);
    const teamOptions = Object.keys(teams);

    console.log('今天日期:', todayString);
    console.log('團隊資料:', teams);

    // 獲取選定團隊的成員
    const getTeamMembers = (team: string) => {
        if (!team || !teams[team]) return [];
        return teams[team].members.map(m => m.name);
    };

    const handleSubmit = async () => {
        if (!selectedTeam || !selectedRole || !selectedMember) {
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
                    lineUserId: mockLineProfile.userId,
                    displayName: mockLineProfile.displayName,
                    pictureUrl: mockLineProfile.pictureUrl,
                    team: selectedTeam,
                    role: selectedRole,
                    memberName: selectedMember
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/leave/2024-12-03');
                }, 2000);
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

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">設定完成！</h2>
                    <p className="text-gray-600 mb-4">
                        您的身份已成功設定為：{selectedTeam}班 {selectedMember} ({selectedRole})
                    </p>
                    <p className="text-sm text-gray-500">
                        正在跳轉到請假頁面...
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
                        身份設定測試頁面
                    </h1>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">模擬 LINE 用戶：</p>
                        <p className="font-medium">{mockLineProfile.displayName}</p>
                        <p className="text-xs text-gray-500 mt-1">User ID: {mockLineProfile.userId}</p>
                        <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ 這是測試頁面，用於驗證身份設定功能
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                選擇班級
                            </label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => {
                                    setSelectedTeam(e.target.value);
                                    setSelectedMember(''); // 重置成員選擇
                                }}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">請選擇班級</option>
                                {teamOptions.map(team => (
                                    <option key={team} value={team}>{team}班</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                選擇角色
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">請選擇角色</option>
                                <option value="班長">班長</option>
                                <option value="班員">班員</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                選擇成員
                            </label>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                disabled={!selectedTeam}
                            >
                                <option value="">請選擇成員</option>
                                {getTeamMembers(selectedTeam).map(member => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedTeam || !selectedRole || !selectedMember}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? '設定中...' : '完成設定'}
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            返回首頁
                        </button>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h3 className="text-sm font-medium text-yellow-800 mb-2">測試說明：</h3>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>1. 選擇您的班級、角色和姓名</li>
                                <li>2. 點擊「完成設定」建立身份綁定</li>
                                <li>3. 系統會自動跳轉到請假頁面</li>
                                <li>4. 在請假頁面您只能為自己請假</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
