'use client';

import { useState } from 'react';

export default function LineTestPage() {
    const [testResults, setTestResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lineUserId, setLineUserId] = useState('');

    const addTestResult = (test: string, success: boolean, data?: any, error?: string) => {
        setTestResults(prev => [...prev, {
            test,
            success,
            data,
            error,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const testLineConfig = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-line-message');
            const data = await response.json();
            addTestResult('LINE Bot Configuration Check', response.ok, data);
        } catch (error) {
            addTestResult('LINE Bot Configuration Check', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const sendTestMessage = async () => {
        if (!lineUserId.trim()) {
            addTestResult('Send Test Message', false, null, '請輸入 LINE User ID');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/test-line-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineUserId: lineUserId.trim()
                }),
            });
            const data = await response.json();
            addTestResult('Send Test Message', response.ok, data);
        } catch (error) {
            addTestResult('Send Test Message', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const testWebhookEndpoint = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/line-webhook', {
                method: 'GET'
            });
            const data = await response.json();
            addTestResult('Webhook Endpoint Health Check', response.ok, data);
        } catch (error) {
            addTestResult('Webhook Endpoint Health Check', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const testOvertimeOpportunityAPI = async () => {
        setLoading(true);
        try {
            // 測試查詢加班機會
            const response = await fetch('/api/overtime-opportunity?memberName=小雞&team=A');
            const data = await response.json();
            addTestResult('Overtime Opportunity Query', response.ok, data);
        } catch (error) {
            addTestResult('Overtime Opportunity Query', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const testOvertimeNotification = async () => {
        setLoading(true);
        try {
            const testData = {
                leaveRecordId: 'test-record-id',
                date: '2025-07-03',
                requesterName: '測試員工',
                requesterTeam: 'A',
                overtimeType: '加整班'
            };

            const response = await fetch('/api/overtime-opportunity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            const data = await response.json();
            addTestResult('Overtime Notification Test', response.ok, data);
        } catch (error) {
            addTestResult('Overtime Notification Test', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const testLineUserStates = async () => {
        setLoading(true);
        try {
            // 這裡可以添加查詢Line用戶狀態的API
            addTestResult('Line User States', true, { message: 'Test not implemented yet' });
        } catch (error) {
            addTestResult('Line User States', false, null, error instanceof Error ? error.message : 'Unknown error');
        }
        setLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Line Bot 功能測試</h1>
            
            {/* LINE User ID 輸入 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">LINE 訊息測試</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            LINE User ID
                        </label>
                        <input
                            type="text"
                            value={lineUserId}
                            onChange={(e) => setLineUserId(e.target.value)}
                            placeholder="請輸入您的 LINE User ID"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            加Bot為好友後發送訊息，從開發服務器日誌中取得User ID
                        </p>
                    </div>
                    <button
                        onClick={sendTestMessage}
                        disabled={loading || !lineUserId.trim()}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        發送測試訊息
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                    onClick={testLineConfig}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    檢查 LINE Bot 設定
                </button>

                <button
                    onClick={testWebhookEndpoint}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    測試 Webhook 端點
                </button>

                <button
                    onClick={testOvertimeOpportunityAPI}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    測試加班機會查詢
                </button>

                <button
                    onClick={testOvertimeNotification}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    測試加班通知
                </button>
                
                <button
                    onClick={testLineUserStates}
                    disabled={loading}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    測試用戶狀態
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={clearResults}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    清除結果
                </button>
            </div>

            <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-xl font-bold mb-4">測試結果</h2>
                
                {testResults.length === 0 ? (
                    <p className="text-gray-500">尚無測試結果</p>
                ) : (
                    <div className="space-y-4">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded border-l-4 ${
                                    result.success 
                                        ? 'bg-green-50 border-green-500' 
                                        : 'bg-red-50 border-red-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold">{result.test}</h3>
                                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                                </div>
                                
                                <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.success ? '✅ 成功' : '❌ 失敗'}
                                </div>
                                
                                {result.error && (
                                    <div className="mt-2 text-red-600 text-sm">
                                        錯誤: {result.error}
                                    </div>
                                )}
                                
                                {result.data && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-blue-600">
                                            查看詳細資料
                                        </summary>
                                        <pre className="mt-2 text-xs bg-gray-200 p-2 rounded overflow-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded">
                <h2 className="text-xl font-bold mb-4">Line Bot 設定說明</h2>
                <div className="space-y-2 text-sm">
                    <p><strong>Webhook URL:</strong> /api/line-webhook</p>
                    <p><strong>環境變數需求:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                        <li>LINE_CHANNEL_ACCESS_TOKEN</li>
                        <li>LINE_CHANNEL_SECRET</li>
                    </ul>
                    <p><strong>功能說明:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                        <li>用戶可以選擇輪值表中的名稱</li>
                        <li>系統會檢查加班資格並發送通知</li>
                        <li>當加班機會消失時會自動通知</li>
                        <li>支援多種指令查詢和管理</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
