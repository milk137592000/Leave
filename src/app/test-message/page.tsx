'use client';

import { useState } from 'react';

export default function TestMessagePage() {
    const [lineUserId, setLineUserId] = useState('U55508e69afeffef5f001175fff31c9a4'); // 鈞的 LINE ID
    const [message, setMessage] = useState('🧪 測試訊息：鈞您好！這是直接發送的測試通知。如果收到此訊息，請回覆「收到測試訊息」。');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [restoreResult, setRestoreResult] = useState<any>(null);
    const [restoreLoading, setRestoreLoading] = useState(false);

    const sendTestMessage = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/test-direct-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineUserId,
                    message
                })
            });

            const data = await response.json();
            setResult({
                success: response.ok,
                status: response.status,
                data
            });

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : '未知錯誤'
            });
        } finally {
            setLoading(false);
        }
    };

    const restoreJunBinding = async () => {
        setRestoreLoading(true);
        setRestoreResult(null);

        try {
            const response = await fetch('/api/user-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineUserId: 'U55508e69afeffef5f001175fff31c9a4',
                    displayName: '鈞',
                    team: 'C',
                    role: '班員',
                    memberName: '鈞'
                })
            });

            const data = await response.json();
            setRestoreResult({
                success: response.ok,
                status: response.status,
                data
            });

        } catch (error) {
            setRestoreResult({
                success: false,
                error: error instanceof Error ? error.message : '未知錯誤'
            });
        } finally {
            setRestoreLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        LINE 訊息測試
                    </h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LINE User ID
                            </label>
                            <input
                                type="text"
                                value={lineUserId}
                                onChange={(e) => setLineUserId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="輸入 LINE User ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                測試訊息
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="輸入要發送的測試訊息"
                            />
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={sendTestMessage}
                                disabled={loading || !lineUserId || !message}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? '發送中...' : '發送測試訊息'}
                            </button>

                            <button
                                onClick={restoreJunBinding}
                                disabled={restoreLoading}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {restoreLoading ? '恢復中...' : '🔄 恢復鈞的綁定記錄'}
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">測試訊息結果</h3>
                            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-medium">狀態：</span>
                                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                                            {result.success ? '✅ 成功' : '❌ 失敗'}
                                        </span>
                                    </div>

                                    {result.status && (
                                        <div>
                                            <span className="font-medium">HTTP 狀態：</span>
                                            <span>{result.status}</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="font-medium">詳細資訊：</span>
                                        <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                                            {JSON.stringify(result.data || result.error, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {restoreResult && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">恢復綁定結果</h3>
                            <div className={`p-4 rounded-md ${restoreResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-medium">狀態：</span>
                                        <span className={restoreResult.success ? 'text-green-600' : 'text-red-600'}>
                                            {restoreResult.success ? '✅ 恢復成功' : '❌ 恢復失敗'}
                                        </span>
                                    </div>

                                    {restoreResult.status && (
                                        <div>
                                            <span className="font-medium">HTTP 狀態：</span>
                                            <span>{restoreResult.status}</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="font-medium">詳細資訊：</span>
                                        <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                                            {JSON.stringify(restoreResult.data || restoreResult.error, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
