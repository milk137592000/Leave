'use client';

import { useState } from 'react';

export default function TestProxyOvertimePage() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testProxyOvertimeNotification = async () => {
        setLoading(true);
        setResult('');

        try {
            // 通過 API 測試代理加班通知
            const response = await fetch('/api/test-proxy-overtime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proxyByName: '測試代理人',
                    proxyByDisplayName: '測試代理人顯示名稱',
                    targetMemberName: '測試被代理人',
                    date: '2025-01-07',
                    overtimeTime: '全天',
                    overtimeType: '加整班'
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult('✅ 代理加班通知發送成功！');
            } else {
                setResult(`❌ 代理加班通知發送失敗: ${data.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.error('測試失敗:', error);
            setResult(`❌ 測試失敗: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const testCreateMessage = () => {
        try {
            // 測試訊息創建
            const testNotification = {
                proxyByName: '張三',
                proxyByDisplayName: '張三 (LINE顯示名)',
                targetMemberName: '李四',
                date: '2025-01-07',
                overtimeTime: '前半天',
                overtimeType: '加一半'
            };

            // 模擬訊息創建邏輯
            const formattedDate = new Date(testNotification.date).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            const message = `🔔 代理加班通知

${testNotification.proxyByName} (${testNotification.proxyByDisplayName}) 已為您填寫加班：

📅 日期：${formattedDate}
⏰ 時段：${testNotification.overtimeTime}
💼 類型：${testNotification.overtimeType}
👤 加班人：${testNotification.targetMemberName}

如有疑問，請聯繫 ${testNotification.proxyByName}。`;

            setResult(`📝 預覽訊息內容：\n\n${message}`);
        } catch (error) {
            setResult(`❌ 訊息創建失敗: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">代理加班通知測試</h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">功能說明</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>• 當有人代替別人填寫加班時，被填寫的加班人員會收到 LINE 通知</p>
                        <p>• 通知內容包含：誰幫填加班、什麼時候要加班、加班類型等資訊</p>
                        <p>• 支援加整班和加一半兩種加班類型</p>
                        <p>• 在加班記錄中會顯示代理填寫的標識</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">測試功能</h2>
                    <div className="space-y-4">
                        <button
                            onClick={testCreateMessage}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            📝 預覽通知訊息
                        </button>
                        
                        <button
                            onClick={testProxyOvertimeNotification}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? '發送中...' : '🔔 測試發送通知'}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4">測試結果</h2>
                        <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
                            {result}
                        </pre>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4">使用說明</h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div>
                            <h3 className="font-medium text-gray-800 mb-1">1. 前端操作</h3>
                            <p>在請假頁面的加班選項中，選擇「替人填寫加班」，然後選擇要加班的人員</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-1">2. 後端處理</h3>
                            <p>系統會記錄代理資訊並自動發送通知給被填寫加班的人員</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-1">3. 通知內容</h3>
                            <p>包含代理人姓名、加班日期、時段、類型等完整資訊</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-1">4. 記錄標識</h3>
                            <p>在加班記錄中會顯示「由 XXX 代填」的標識</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a 
                        href={`/leave/${new Date().toISOString().split('T')[0]}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        前往今天的請假頁面測試
                    </a>
                </div>
            </div>
        </div>
    );
}
