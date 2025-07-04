'use client';

import { useState } from 'react';

export default function TestNotificationPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [junProfile, setJunProfile] = useState<any>(null);

    const fetchJunProfile = async () => {
        try {
            const response = await fetch('/api/line-admin/users');
            if (response.ok) {
                const data = await response.json();
                const jun = data.users?.find((u: any) => u.memberName === '鈞');
                setJunProfile(jun);
                return jun;
            }
        } catch (error) {
            console.error('獲取鈞的資料失敗:', error);
        }
        return null;
    };

    const testDirectMessage = async () => {
        setLoading(true);
        setResult(null);

        try {
            const jun = await fetchJunProfile();
            if (!jun) {
                setResult({ error: '找不到鈞的註冊記錄' });
                return;
            }

            const response = await fetch('/api/test-direct-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineUserId: jun.lineUserId,
                    message: '🧪 瀏覽器測試：鈞您好！這是從瀏覽器發送的測試通知。'
                })
            });

            const data = await response.json();
            setResult({
                status: response.status,
                success: response.ok,
                data
            });

        } catch (error) {
            setResult({ error: error instanceof Error ? error.message : '未知錯誤' });
        } finally {
            setLoading(false);
        }
    };

    const testOvertimeCancellation = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/overtime-opportunity', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: '2025-07-05',
                    requesterName: '瀏覽器測試',
                    requesterTeam: 'A',
                    reason: '瀏覽器測試：檢查鈞是否能收到加班取消通知',
                    excludeNames: []
                })
            });

            const data = await response.json();
            setResult({
                status: response.status,
                success: response.ok,
                data
            });

        } catch (error) {
            setResult({ error: error instanceof Error ? error.message : '未知錯誤' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        通知測試頁面
                    </h1>

                    {junProfile && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">鈞的註冊資料：</h3>
                            <p>姓名: {junProfile.memberName}</p>
                            <p>班級: {junProfile.team}班</p>
                            <p>角色: {junProfile.role}</p>
                            <p>LINE ID: {junProfile.lineUserId}</p>
                            <p>通知啟用: {junProfile.notificationEnabled ? '✅ 是' : '❌ 否'}</p>
                            <p>註冊時間: {new Date(junProfile.createdAt).toLocaleString()}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <button
                            onClick={testDirectMessage}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? '發送中...' : '📱 測試直接發送訊息給鈞'}
                        </button>

                        <button
                            onClick={testOvertimeCancellation}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? '發送中...' : '❌ 測試加班取消通知'}
                        </button>
                    </div>

                    {result && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">測試結果：</h3>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 注意事項：</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• 這個測試頁面可以直接測試 LINE 通知功能</li>
                            <li>• 如果測試成功，鈞應該會收到 LINE 訊息</li>
                            <li>• 如果測試失敗，會顯示詳細的錯誤信息</li>
                            <li>• 請確認鈞已加 LINE Bot 為好友且未封鎖</li>
                        </ul>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            返回主頁
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
