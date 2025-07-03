'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const testApi = async () => {
        try {
            addLog('=== 開始 API 測試 ===');
            setLogs([]);
            
            const testDate = '2025-07-03';
            addLog(`測試日期: ${testDate}`);
            
            // 測試 API 調用
            addLog('發送 API 請求...');
            const response = await fetch(`/api/leave?date=${testDate}`);
            
            addLog(`響應狀態: ${response.status} ${response.statusText}`);
            addLog(`響應 OK: ${response.ok}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                addLog(`❌ 錯誤響應內容: ${errorText}`);
                return;
            }
            
            const data = await response.json();
            addLog(`✅ 響應數據類型: ${Array.isArray(data) ? 'Array' : typeof data}`);
            addLog(`✅ 數據長度: ${Array.isArray(data) ? data.length : 'N/A'}`);
            addLog(`✅ 響應數據: ${JSON.stringify(data, null, 2)}`);
            
        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    const testDifferentDates = async () => {
        try {
            addLog('=== 測試不同日期格式 ===');
            setLogs([]);
            
            const testDates = [
                '2025-07-03',
                '2025-7-3',
                '2025/07/03',
                '2025/7/3'
            ];
            
            for (const testDate of testDates) {
                addLog(`\n--- 測試日期: ${testDate} ---`);
                
                try {
                    const response = await fetch(`/api/leave?date=${encodeURIComponent(testDate)}`);
                    addLog(`${testDate} -> 狀態: ${response.status}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        addLog(`${testDate} -> ✅ 成功，數據長度: ${Array.isArray(data) ? data.length : 'N/A'}`);
                    } else {
                        const errorText = await response.text();
                        addLog(`${testDate} -> ❌ 失敗: ${errorText}`);
                    }
                } catch (error) {
                    addLog(`${testDate} -> ❌ 錯誤: ${error}`);
                }
            }
            
        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    const testApiHealth = async () => {
        try {
            addLog('=== 測試 API 健康狀態 ===');
            setLogs([]);
            
            // 測試不帶參數的調用
            addLog('測試不帶參數的 API 調用...');
            const response = await fetch('/api/leave');
            
            addLog(`響應狀態: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                addLog(`✅ 成功，數據類型: ${Array.isArray(data) ? 'Array' : typeof data}`);
                addLog(`✅ 數據長度: ${Array.isArray(data) ? data.length : 'N/A'}`);
            } else {
                const errorText = await response.text();
                addLog(`❌ 錯誤響應: ${errorText}`);
            }
            
        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    if (!isClient) {
        return <div className="p-8">載入中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🔧 API 測試頁面
                    </h1>
                    
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={testApi}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            測試特定日期 API
                        </button>
                        
                        <button
                            onClick={testDifferentDates}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            測試不同日期格式
                        </button>
                        
                        <button
                            onClick={testApiHealth}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                            測試 API 健康狀態
                        </button>
                    </div>

                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">點擊按鈕開始測試...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">🎯 測試目的</h3>
                    <p className="text-yellow-700 text-sm">
                        這個頁面會測試 /api/leave 端點，幫助診斷 400 Bad Request 錯誤的原因。
                        請點擊不同的測試按鈕並查看結果。
                    </p>
                </div>
            </div>
        </div>
    );
}
