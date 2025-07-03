'use client';

import { useEffect, useState } from 'react';

export default function LineFlowDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [liffProfile, setLiffProfile] = useState<any>(null);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const testFullFlow = async () => {
        try {
            addLog('=== 開始完整 LINE 流程測試 ===');
            setLogs([]);
            
            // 步驟 1: 檢查 LIFF 初始化
            addLog('步驟 1: 檢查 LIFF 初始化');
            if (!(window as any).liff) {
                addLog('❌ LIFF 未載入');
                return;
            }
            addLog('✅ LIFF 已載入');

            // 步驟 2: 檢查登入狀態
            addLog('步驟 2: 檢查登入狀態');
            const isLoggedIn = (window as any).liff.isLoggedIn();
            addLog(`登入狀態: ${isLoggedIn}`);

            if (!isLoggedIn) {
                addLog('❌ 用戶未登入，無法繼續測試');
                return;
            }

            // 步驟 3: 獲取 LIFF Profile
            addLog('步驟 3: 獲取 LIFF Profile');
            try {
                const profile = await (window as any).liff.getProfile();
                addLog(`✅ LIFF Profile 獲取成功:`);
                addLog(`  - User ID: ${profile.userId}`);
                addLog(`  - Display Name: ${profile.displayName}`);
                addLog(`  - Picture URL: ${profile.pictureUrl || 'N/A'}`);
                setLiffProfile(profile);

                // 步驟 4: 測試 API 調用
                addLog('步驟 4: 測試用戶資料 API');
                await testUserProfileApi(profile.userId);

            } catch (profileError) {
                addLog(`❌ 獲取 LIFF Profile 失敗: ${profileError}`);
            }

        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    const testUserProfileApi = async (lineUserId: string) => {
        try {
            addLog(`測試 API: /api/user-profile?lineUserId=${lineUserId}`);
            
            // 檢查參數
            if (!lineUserId || typeof lineUserId !== 'string') {
                addLog(`❌ LINE User ID 無效: "${lineUserId}" (類型: ${typeof lineUserId})`);
                return;
            }
            
            addLog(`✅ LINE User ID 有效: "${lineUserId}"`);
            
            const response = await fetch(`/api/user-profile?lineUserId=${encodeURIComponent(lineUserId)}`);
            
            addLog(`API 響應狀態: ${response.status} ${response.statusText}`);
            addLog(`API 響應 OK: ${response.ok}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                addLog(`❌ API 錯誤響應內容: ${errorText}`);
                return;
            }
            
            const data = await response.json();
            addLog(`✅ API 響應成功:`);
            addLog(`  - Exists: ${data.exists}`);
            if (data.profile) {
                addLog(`  - Member Name: ${data.profile.memberName}`);
                addLog(`  - Team: ${data.profile.team}`);
                addLog(`  - Role: ${data.profile.role}`);
            }
            
        } catch (error) {
            addLog(`❌ API 調用錯誤: ${error}`);
        }
    };

    const testDirectLogin = async () => {
        try {
            addLog('=== 測試直接登入 ===');
            setLogs([]);
            
            if (!(window as any).liff) {
                addLog('❌ LIFF 未載入');
                return;
            }
            
            const isLoggedIn = (window as any).liff.isLoggedIn();
            addLog(`當前登入狀態: ${isLoggedIn}`);
            
            if (isLoggedIn) {
                addLog('✅ 用戶已登入，獲取資料...');
                await testFullFlow();
            } else {
                addLog('開始登入流程...');
                const redirectUrl = `${window.location.origin}/line-flow-debug`;
                addLog(`重定向 URL: ${redirectUrl}`);
                (window as any).liff.login({ redirectUri: redirectUrl });
            }
            
        } catch (error) {
            addLog(`❌ 登入測試錯誤: ${error}`);
        }
    };

    const testApiDirectly = async () => {
        try {
            addLog('=== 測試 API 端點 ===');
            setLogs([]);
            
            // 測試不同的參數
            const testCases = [
                { name: '空參數', lineUserId: '' },
                { name: '無效參數', lineUserId: 'invalid' },
                { name: '測試用戶', lineUserId: 'test-user-123' }
            ];
            
            for (const testCase of testCases) {
                addLog(`\n--- 測試案例: ${testCase.name} ---`);
                addLog(`參數: lineUserId="${testCase.lineUserId}"`);
                
                try {
                    const response = await fetch(`/api/user-profile?lineUserId=${encodeURIComponent(testCase.lineUserId)}`);
                    addLog(`響應狀態: ${response.status} ${response.statusText}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        addLog(`✅ 成功: ${JSON.stringify(data)}`);
                    } else {
                        const errorText = await response.text();
                        addLog(`❌ 失敗: ${errorText}`);
                    }
                } catch (error) {
                    addLog(`❌ 錯誤: ${error}`);
                }
            }
            
        } catch (error) {
            addLog(`❌ API 測試錯誤: ${error}`);
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
                        🔍 LINE 完整流程調試
                    </h1>
                    
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={testFullFlow}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            測試完整流程
                        </button>
                        
                        <button
                            onClick={testDirectLogin}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
                        >
                            測試登入流程
                        </button>
                        
                        <button
                            onClick={testApiDirectly}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                            測試 API 端點
                        </button>
                    </div>

                    {liffProfile && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                            <h3 className="font-medium text-green-800 mb-2">✅ LIFF Profile</h3>
                            <div className="text-green-700 text-sm">
                                <p><strong>User ID:</strong> {liffProfile.userId}</p>
                                <p><strong>Display Name:</strong> {liffProfile.displayName}</p>
                            </div>
                        </div>
                    )}

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
                        這個頁面會測試完整的 LINE 登入和 API 調用流程，幫助找出 400 Bad Request 錯誤的確切原因。
                        請按順序測試不同的功能。
                    </p>
                </div>
            </div>
        </div>
    );
}
