'use client';

import { useEffect, useState } from 'react';

export default function LiffSimpleTestPage() {
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

    const testLiffId = async (liffId: string) => {
        addLog(`=== 測試 LIFF ID: ${liffId} ===`);
        
        try {
            // 檢查 LIFF SDK
            if (!(window as any).liff) {
                addLog('載入 LIFF SDK...');
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                addLog('LIFF SDK 載入完成');
            }

            // 重置 LIFF（如果已初始化）
            if ((window as any).liff && (window as any).liff._config) {
                addLog('重置 LIFF 狀態...');
                delete (window as any).liff._config;
            }

            // 嘗試初始化
            addLog(`嘗試初始化 LIFF ID: ${liffId}`);
            addLog(`LIFF ID 類型: ${typeof liffId}`);
            addLog(`LIFF ID 長度: ${liffId.length}`);
            addLog(`LIFF ID 內容: "${liffId}"`);

            await (window as any).liff.init({ liffId: liffId });
            
            addLog(`✅ 成功！LIFF ID ${liffId} 初始化成功`);
            addLog(`在客戶端中: ${(window as any).liff.isInClient()}`);
            addLog(`已登入: ${(window as any).liff.isLoggedIn()}`);
            
            return true;
        } catch (error: any) {
            addLog(`❌ 失敗！錯誤: ${error.message}`);
            addLog(`錯誤類型: ${error.constructor.name}`);
            return false;
        }
    };

    const runAllTests = async () => {
        if (!isClient) return;
        
        setLogs([]);
        addLog('開始 LIFF 簡單測試...');
        addLog(`當前域名: ${window.location.hostname}`);
        addLog(`當前 URL: ${window.location.href}`);
        addLog(`是否 HTTPS: ${window.location.protocol === 'https:'}`);

        // 測試多個 LIFF ID
        const testIds = [
            '2007680034-QnRpBayW',  // 你的 LIFF ID
            '1234567890-abcdefgh',  // 假的 ID 用來測試錯誤
        ];

        for (const id of testIds) {
            const success = await testLiffId(id);
            if (success) {
                addLog('找到有效的 LIFF ID，停止測試');
                break;
            }
            addLog('---');
        }

        addLog('測試完成');
    };

    if (!isClient) {
        return <div className="p-8">載入中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🧪 LIFF 簡單測試
                    </h1>
                    
                    <div className="mb-4">
                        <button
                            onClick={runAllTests}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            開始測試
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded">
                        <h3 className="font-medium mb-2">測試資訊</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>目標 LIFF ID:</strong> 2007680034-QnRpBayW</p>
                            <p><strong>當前域名:</strong> {window.location.hostname}</p>
                            <p><strong>協議:</strong> {window.location.protocol}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 測試日誌
                    </h2>
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">點擊 "開始測試" 來執行測試...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">🔍 如果測試失敗</h3>
                    <div className="text-yellow-700 text-sm space-y-1">
                        <p>1. 檢查 LINE 開發者控制台中的 LIFF 應用設定</p>
                        <p>2. 確認域名 leave-ten.vercel.app 在授權域名列表中</p>
                        <p>3. 檢查 LIFF 應用是否啟用</p>
                        <p>4. 嘗試重新創建 LIFF 應用</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
