'use client';

import { useEffect, useState } from 'react';

export default function SimpleLiffTestPage() {
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
        addLog('頁面載入完成');
    }, []);

    const testLiffOnly = async () => {
        try {
            addLog('=== 純 LIFF 測試（不使用 hook） ===');
            setLogs([]);
            
            // 步驟 1: 載入 LIFF SDK
            addLog('步驟 1: 載入 LIFF SDK');
            if (!(window as any).liff) {
                addLog('載入 LIFF SDK...');
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('LIFF SDK 載入超時'));
                    }, 10000);
                    
                    script.onload = () => {
                        clearTimeout(timeout);
                        addLog('✅ LIFF SDK 載入成功');
                        setTimeout(() => {
                            if ((window as any).liff) {
                                resolve(true);
                            } else {
                                reject(new Error('LIFF 物件未正確初始化'));
                            }
                        }, 100);
                    };
                    
                    script.onerror = (err) => {
                        clearTimeout(timeout);
                        addLog('❌ LIFF SDK 載入失敗');
                        reject(new Error('LIFF SDK 載入失敗'));
                    };
                    
                    document.head.appendChild(script);
                });
            } else {
                addLog('✅ LIFF SDK 已存在');
            }

            // 步驟 2: 初始化 LIFF
            addLog('步驟 2: 初始化 LIFF');
            const liffId = '2007680034-QnRpBayW';
            addLog(`使用 LIFF ID: ${liffId}`);
            
            try {
                const config = { liffId: liffId };
                addLog(`初始化配置: ${JSON.stringify(config)}`);
                await (window as any).liff.init(config);
                addLog('✅ LIFF 初始化成功');
            } catch (initError) {
                addLog(`❌ LIFF 初始化失敗: ${initError}`);
                return;
            }

            // 步驟 3: 檢查登入狀態
            addLog('步驟 3: 檢查登入狀態');
            const isLoggedIn = (window as any).liff.isLoggedIn();
            addLog(`登入狀態: ${isLoggedIn}`);

            if (isLoggedIn) {
                // 步驟 4: 獲取用戶資料
                addLog('步驟 4: 獲取用戶資料');
                try {
                    const profile = await (window as any).liff.getProfile();
                    addLog(`✅ 用戶資料獲取成功:`);
                    addLog(`  - User ID: ${profile.userId}`);
                    addLog(`  - Display Name: ${profile.displayName}`);
                    addLog(`  - Picture URL: ${profile.pictureUrl || 'N/A'}`);
                } catch (profileError) {
                    addLog(`❌ 獲取用戶資料失敗: ${profileError}`);
                }
            } else {
                addLog('用戶未登入');
            }

        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    const testLogin = async () => {
        try {
            addLog('=== 測試登入功能 ===');
            setLogs([]);
            
            if (!(window as any).liff) {
                addLog('❌ LIFF 未載入，請先執行 LIFF 測試');
                return;
            }

            const isLoggedIn = (window as any).liff.isLoggedIn();
            addLog(`當前登入狀態: ${isLoggedIn}`);

            if (isLoggedIn) {
                addLog('✅ 用戶已登入');
                return;
            }

            addLog('開始登入流程...');
            
            // 使用已配置的重定向 URL
            const redirectUrl = `${window.location.origin}/line-redirect`;
            addLog(`使用已配置的重定向 URL: ${redirectUrl}`);

            try {
                (window as any).liff.login({ redirectUri: redirectUrl });
                addLog('✅ 登入函數調用成功，等待重定向...');
            } catch (loginError) {
                addLog(`❌ 登入失敗: ${loginError}`);
            }

        } catch (error) {
            addLog(`❌ 登入測試錯誤: ${error}`);
        }
    };

    const checkEnvironment = () => {
        addLog('=== 環境檢查 ===');
        setLogs([]);
        
        addLog(`當前 URL: ${window.location.href}`);
        addLog(`User Agent: ${navigator.userAgent}`);
        addLog(`是否在 LINE 內: ${navigator.userAgent.includes('Line')}`);
        addLog(`協議: ${window.location.protocol}`);
        addLog(`域名: ${window.location.hostname}`);
        addLog(`端口: ${window.location.port || '默認'}`);
        
        // 檢查是否有現有的 LIFF 腳本
        const existingScripts = document.querySelectorAll('script[src*="liff"]');
        addLog(`現有 LIFF 腳本數量: ${existingScripts.length}`);
        
        existingScripts.forEach((script, index) => {
            addLog(`  腳本 ${index + 1}: ${(script as HTMLScriptElement).src}`);
        });
        
        addLog(`LIFF 物件存在: ${!!(window as any).liff}`);
        if ((window as any).liff) {
            addLog(`LIFF 類型: ${typeof (window as any).liff}`);
            addLog(`LIFF.init 存在: ${typeof (window as any).liff.init}`);
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
                        🧪 純 LIFF 測試（不使用 hook）
                    </h1>
                    
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={checkEnvironment}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            檢查環境
                        </button>
                        
                        <button
                            onClick={testLiffOnly}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            測試 LIFF 載入和初始化
                        </button>
                        
                        <button
                            onClick={testLogin}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            測試登入功能
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

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <h3 className="font-medium text-blue-800 mb-2">🎯 測試目的</h3>
                    <p className="text-blue-700 text-sm">
                        這個頁面直接測試 LIFF SDK，不使用任何 React hook，幫助隔離問題。
                        請按順序點擊按鈕：1. 檢查環境 → 2. 測試 LIFF → 3. 測試登入
                    </p>
                </div>
            </div>
        </div>
    );
}
