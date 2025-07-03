'use client';

import { useEffect, useState } from 'react';

declare global {
    interface Window {
        liff: any;
    }
}

export default function LineDebugPage() {
    const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        initializeDebug();
    }, []);

    const initializeDebug = async () => {
        addLog('開始調試...');

        // 檢查環境變數
        let liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        addLog(`環境變數 LIFF ID: ${liffId || '未設定'}`);

        // 如果環境變數未設定，使用硬編碼值
        if (!liffId || liffId.trim() === '') {
            liffId = '2007680034-QnRpBayW';
            addLog(`使用硬編碼 LIFF ID: ${liffId}`);
        }

        addLog(`最終 LIFF ID: ${liffId}`);
        addLog(`LIFF ID 長度: ${liffId ? liffId.length : 0}`);
        addLog(`LIFF ID 類型: ${typeof liffId}`);

        // 檢查所有相關環境變數
        const envVars = {
            NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
            NODE_ENV: process.env.NODE_ENV
        };
        addLog(`環境變數: ${JSON.stringify(envVars, null, 2)}`);

        setDebugInfo(prev => ({
            ...prev,
            liffId,
            envVars,
            currentUrl: window.location.href,
            userAgent: navigator.userAgent,
            isInLineApp: navigator.userAgent.includes('Line')
        }));

        if (!liffId || liffId.trim() === '') {
            addLog('❌ LIFF ID 仍然無效');
            return;
        }

        try {
            // 載入 LIFF SDK
            addLog('載入 LIFF SDK...');
            const script = document.createElement('script');
            script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
            
            script.onload = async () => {
                try {
                    addLog('LIFF SDK 載入成功，檢查初始化狀態...');

                    // 檢查是否已經初始化
                    if (window.liff.isInClient !== undefined) {
                        addLog('LIFF 已經初始化，跳過重複初始化');
                    } else {
                        addLog(`開始初始化 LIFF，使用 ID: ${liffId}`);
                        addLog(`LIFF ID 類型: ${typeof liffId}, 長度: ${liffId?.length}`);

                        if (!liffId) {
                            throw new Error('LIFF ID 為空或未定義');
                        }

                        await window.liff.init({ liffId: liffId });
                        addLog('✅ LIFF 初始化成功');
                    }

                    const isLoggedIn = window.liff.isLoggedIn();
                    addLog(`登入狀態: ${isLoggedIn ? '已登入' : '未登入'}`);

                    setDebugInfo(prev => ({
                        ...prev,
                        liffInitialized: true,
                        isLoggedIn,
                        isInClient: window.liff.isInClient(),
                        isApiAvailable: window.liff.isApiAvailable('shareTargetPicker')
                    }));

                    if (isLoggedIn) {
                        try {
                            const profile = await window.liff.getProfile();
                            addLog(`✅ 取得用戶資料: ${profile.displayName}`);
                            setDebugInfo(prev => ({
                                ...prev,
                                profile
                            }));

                            // 檢查 API
                            const response = await fetch(`/api/user-profile?lineUserId=${profile.userId}`);
                            const userData = await response.json();
                            addLog(`API 回應: ${JSON.stringify(userData)}`);
                            
                            setDebugInfo(prev => ({
                                ...prev,
                                apiResponse: userData
                            }));

                        } catch (error) {
                            addLog(`❌ 取得用戶資料失敗: ${error}`);
                        }
                    }

                } catch (error) {
                    addLog(`❌ LIFF 初始化失敗: ${error}`);
                    setDebugInfo(prev => ({
                        ...prev,
                        initError: String(error)
                    }));
                }
            };

            script.onerror = () => {
                addLog('❌ LIFF SDK 載入失敗');
            };

            document.head.appendChild(script);

        } catch (error) {
            addLog(`❌ 載入過程失敗: ${error}`);
        }
    };

    const testLogin = () => {
        if (window.liff && window.liff.login) {
            addLog('嘗試登入...');
            window.liff.login();
        } else {
            addLog('❌ LIFF 未初始化');
        }
    };

    const testLogout = () => {
        if (window.liff && window.liff.logout) {
            addLog('登出...');
            window.liff.logout();
            window.location.reload();
        } else {
            addLog('❌ LIFF 未初始化');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">LINE LIFF 調試頁面</h1>
                
                {/* 調試資訊 */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">系統資訊</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                {/* 操作按鈕 */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">操作</h2>
                    <div className="space-x-4">
                        <button
                            onClick={testLogin}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            測試登入
                        </button>
                        <button
                            onClick={testLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            登出
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            重新載入
                        </button>
                    </div>
                </div>

                {/* 日誌 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">執行日誌</h2>
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-auto">
                        {logs.map((log, index) => (
                            <div key={index}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
