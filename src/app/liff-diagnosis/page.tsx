'use client';

import { useEffect, useState } from 'react';

export default function LiffDiagnosisPage() {
    const [isClient, setIsClient] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [currentTest, setCurrentTest] = useState('');

    const addResult = (test: string, success: boolean, message: string, details?: any) => {
        const result = {
            test,
            success,
            message,
            details,
            timestamp: new Date().toLocaleTimeString()
        };
        console.log(`[${result.timestamp}] ${test}: ${success ? '✅' : '❌'} ${message}`, details || '');
        setResults(prev => [...prev, result]);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const runDiagnosis = async () => {
            setResults([]);
            
            // 測試 1: 環境檢查
            setCurrentTest('環境檢查');
            addResult('環境檢查', true, '客戶端環境正常', {
                url: window.location.href,
                userAgent: navigator.userAgent,
                isHttps: window.location.protocol === 'https:',
                domain: window.location.hostname
            });

            // 測試 2: LIFF SDK 載入
            setCurrentTest('LIFF SDK 載入');
            try {
                if (!(window as any).liff) {
                    const script = document.createElement('script');
                    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                addResult('LIFF SDK 載入', true, 'SDK 載入成功');
            } catch (error) {
                addResult('LIFF SDK 載入', false, `SDK 載入失敗: ${error}`);
                return;
            }

            // 測試 3: 測試多個 LIFF ID
            const testLiffIds = [
                '2007680034-QnRpBayW', // 當前使用的
                '1234567890-abcdefgh', // 測試用假 ID
                '2000000000-testtest', // 另一個測試 ID
            ];

            for (const liffId of testLiffIds) {
                setCurrentTest(`測試 LIFF ID: ${liffId}`);
                
                try {
                    // 重置 LIFF 狀態（如果可能）
                    if ((window as any).liff && (window as any).liff._config) {
                        delete (window as any).liff._config;
                    }

                    await (window as any).liff.init({ liffId });
                    addResult(`LIFF ID 測試`, true, `ID ${liffId} 初始化成功`, {
                        liffId,
                        isInClient: (window as any).liff.isInClient(),
                        isLoggedIn: (window as any).liff.isLoggedIn()
                    });
                    break; // 如果成功就停止測試其他 ID
                } catch (error: any) {
                    addResult(`LIFF ID 測試`, false, `ID ${liffId} 失敗: ${error.message}`, {
                        liffId,
                        errorType: error.constructor.name,
                        errorMessage: error.message
                    });
                }
            }

            // 測試 4: 環境變數檢查
            setCurrentTest('環境變數檢查');
            const envVars = {
                NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
                NODE_ENV: process.env.NODE_ENV
            };
            addResult('環境變數檢查', true, '環境變數狀態', envVars);

            // 測試 5: 網路連接測試（通過 API 端點）
            setCurrentTest('網路連接測試');
            try {
                // 使用我們的 API 端點來測試 LINE 連接，因為客戶端無法直接訪問 LINE_CHANNEL_ACCESS_TOKEN
                const response = await fetch('/api/test-line-message', {
                    method: 'GET'
                });
                const data = await response.json();
                addResult('LINE API 連接', response.ok, response.ok ? 'LINE Bot 設定正常' : `連接失敗: ${data.error}`, {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
            } catch (error) {
                addResult('LINE API 連接', false, `連接失敗: ${error}`);
            }

            setCurrentTest('診斷完成');
        };

        runDiagnosis();
    }, [isClient]);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🔍 LIFF 問題診斷工具
                    </h1>
                    
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            當前測試: {currentTest}
                        </span>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                        <h3 className="font-medium text-yellow-800 mb-2">⚠️ 診斷目的</h3>
                        <p className="text-yellow-700 text-sm">
                            這個工具會測試多個 LIFF ID 和環境設定，幫助找出 "liffId is necessary" 錯誤的根本原因。
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 診斷結果 ({results.length} 項)
                    </h2>
                    
                    {results.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">正在執行診斷...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div key={index} className={`border rounded-lg p-4 ${
                                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span className={`text-lg mr-2 ${
                                                    result.success ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {result.success ? '✅' : '❌'}
                                                </span>
                                                <h3 className="font-medium text-gray-900">{result.test}</h3>
                                                <span className="ml-auto text-xs text-gray-500">{result.timestamp}</span>
                                            </div>
                                            <p className={`text-sm ${
                                                result.success ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                                {result.message}
                                            </p>
                                            {result.details && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                                                        顯示詳細資訊
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(result.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h3 className="font-medium text-blue-800 mb-2">💡 下一步建議</h3>
                        <div className="text-blue-700 text-sm space-y-1">
                            <p>1. 如果所有 LIFF ID 都失敗，請檢查 LINE 開發者控制台設定</p>
                            <p>2. 確認域名 leave-ten.vercel.app 在 LIFF 應用白名單中</p>
                            <p>3. 檢查 LIFF 應用是否處於啟用狀態</p>
                            <p>4. 考慮重新創建 LIFF 應用</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
