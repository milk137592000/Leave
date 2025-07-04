'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
    lineUserId: string;
    displayName: string;
    team: string;
    role: string;
    memberName: string;
    notificationEnabled: boolean;
    createdAt: string;
}

interface TeamStats {
    [team: string]: {
        total: number;
        enabled: number;
        users: UserProfile[];
    };
}

export default function LineAdminPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [teamStats, setTeamStats] = useState<TeamStats>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/line-admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                calculateStats(data.users);
            }
        } catch (error) {
            console.error('獲取用戶列表失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetUserBinding = async (user: UserProfile) => {
        if (!confirm(`確定要重置 ${user.memberName} 的 LINE 綁定嗎？\n\n重置後該用戶需要重新進行身份設定才能收到通知。`)) {
            return;
        }

        try {
            const response = await fetch(`/api/line-admin/users?lineUserId=${encodeURIComponent(user.lineUserId)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert(`${user.memberName} 的 LINE 綁定已重置！\n\n請通知該用戶重新進行身份設定。`);
                fetchUsers(); // 重新載入用戶列表
            } else {
                const errorData = await response.json();
                alert(`重置失敗: ${errorData.error}`);
            }
        } catch (error) {
            console.error('重置用戶綁定失敗:', error);
            alert('重置失敗，請稍後再試');
        }
    };

    const calculateStats = (userList: UserProfile[]) => {
        const stats: TeamStats = {};
        
        userList.forEach(user => {
            if (!stats[user.team]) {
                stats[user.team] = { total: 0, enabled: 0, users: [] };
            }
            stats[user.team].total++;
            if (user.notificationEnabled) {
                stats[user.team].enabled++;
            }
            stats[user.team].users.push(user);
        });

        setTeamStats(stats);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        LINE 連動管理
                    </h1>

                    {/* 總覽統計 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800">總用戶數</h3>
                            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800">啟用通知</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {users.filter(u => u.notificationEnabled).length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-yellow-800">已註冊班級</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {Object.keys(teamStats).length}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-800">平均覆蓋率</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {users.length > 0 ? Math.round((users.filter(u => u.notificationEnabled).length / users.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* 各班級詳情 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(teamStats).map(([team, stats]) => (
                        <div key={team} className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{team}班</h2>
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>通知覆蓋率</span>
                                    <span>{stats.enabled}/{stats.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${stats.total > 0 ? (stats.enabled / stats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {stats.users.map(user => (
                                    <div key={user.lineUserId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{user.memberName}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                            <p className="text-xs text-gray-400">註冊: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`w-2 h-2 rounded-full ${user.notificationEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            <button
                                                onClick={() => resetUserBinding(user)}
                                                className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                                                title="重置 LINE 綁定"
                                            >
                                                重置
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {stats.users.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    尚無註冊用戶
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
