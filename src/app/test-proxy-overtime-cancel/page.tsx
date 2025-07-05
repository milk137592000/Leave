'use client';

import { useState } from 'react';

export default function TestProxyOvertimeCancelPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const testProxyOvertimeCancelNotification = async () => {
        setLoading(true);
        setResult('');

        try {
            // 通過 API 測試代理取消加班通知
            const response = await fetch('/api/test-proxy-overtime-cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cancelledByName: '測試取消者',
                    cancelledByDisplayName: '測試取消者顯示名稱',
                    targetMemberName: '測試被取消人',
                    date: '2025-01-07',
                    overtimeTime: '全天',
                    overtimeType: '加整班',
                    reason: '測試取消加班'
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult('✅ 代理取消加班通知發送成功！');
            } else {
                setResult(`❌ 代理取消加班通知發送失敗: ${data.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.error('測試失敗:', error);
            setResult(`❌ 測試失敗: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">測試代理取消加班通知</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-4 text-gray-600">
                    這個頁面用於測試代理取消加班通知功能。
                    點擊下方按鈕將發送一個測試通知。
                </p>
                
                <button
                    onClick={testProxyOvertimeCancelNotification}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                    {loading ? '發送中...' : '測試代理取消加班通知'}
                </button>
                
                {result && (
                    <div className={`mt-4 p-3 rounded-md ${
                        result.includes('✅') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {result}
                    </div>
                )}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-blue-800">測試說明</h2>
                <ul className="text-blue-700 space-y-1">
                    <li>• 這個測試會發送代理取消加班通知給指定的測試用戶</li>
                    <li>• 通知內容包含取消者信息、被取消者信息、日期、時段等</li>
                    <li>• 確保 LINE Bot 配置正確且目標用戶已註冊</li>
                </ul>
            </div>
        </div>
    );
}
