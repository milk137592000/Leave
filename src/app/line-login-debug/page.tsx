'use client';

import { useEffect, useState } from 'react';
import { useLineAuth } from '@/hooks/useLineAuth';

export default function LineLoginDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    const {
        isLiffReady,
        isLoggedIn,
        liffProfile,
        userProfile,
        isLoading: authLoading,
        error: authError,
        login
    } = useLineAuth();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        addLog('=== LINE 登入調試頁面載入 ===');
        addLog(`當前 URL: ${window.location.href}`);
    }, [isClient]);

    useEffect(() => {
        addLog(`isLiffReady 變更: ${isLiffReady}`);
    }, [isLiffReady]);

    useEffect(() => {
        addLog(`isLoggedIn 變更: ${isLoggedIn}`);
    }, [isLoggedIn]);

    useEffect(() => {
        addLog(`authLoading 變更: ${authLoading}`);
    }, [authLoading]);

    useEffect(() => {
        if (authError) {
            addLog(`❌ authError: ${authError}`);
        }
    }, [authError]);

    useEffect(() => {
        if (liffProfile) {
            addLog(`✅ liffProfile 獲取成功: ${liffProfile.displayName} (${liffProfile.userId})`);
        }
    }, [liffProfile]);

    useEffect(() => {
        if (userProfile) {
            addLog(`✅ userProfile 獲取成功: ${userProfile.memberName} (${userProfile.team})`);
        }
    }, [userProfile]);

    const testLogin = () => {
        addLog('=== 開始測試登入 ===');
        try {
            login();
            addLog('✅ 登入函數調用成功');
        } catch (error) {
            addLog(`❌ 登入函數調用失敗: ${error}`);
        }
    };

    const testApiCall = async () => {
        addLog('=== 測試 API 調用 ===');
        
        if (!liffProfile) {
            addLog('❌ 沒有 LIFF Profile，無法測試 API');
            return;
        }

        try {
            // 測試獲取用戶資料 API
            addLog(`測試獲取用戶資料 API，LINE User ID: ${liffProfile.userId}`);
            const response = await fetch(`/api/user-profile?lineUserId=${liffProfile.userId}`);
            
            addLog(`API 響應狀態: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                addLog(`✅ API 調用成功: ${JSON.stringify(data)}`);
            } else {
                const errorText = await response.text();
                addLog(`❌ API 調用失敗: ${errorText}`);
            }
        } catch (error) {
            addLog(`❌ API 調用錯誤: ${error}`);
        }
    };

    const checkLiffStatus = () => {
        addLog('=== 檢查 LIFF 狀態 ===');
        
        if (typeof window !== 'undefined' && (window as any).liff) {
            const liff = (window as any).liff;
            addLog(`LIFF 物件存在: true`);
            addLog(`LIFF.isInClient: ${typeof liff.isInClient === 'function' ? liff.isInClient() : 'N/A'}`);
            addLog(`LIFF.isLoggedIn: ${typeof liff.isLoggedIn === 'function' ? liff.isLoggedIn() : 'N/A'}`);
            addLog(`LIFF.getOS: ${typeof liff.getOS === 'function' ? liff.getOS() : 'N/A'}`);
            addLog(`LIFF.getLanguage: ${typeof liff.getLanguage === 'function' ? liff.getLanguage() : 'N/A'}`);
            addLog(`LIFF.getVersion: ${typeof liff.getVersion === 'function' ? liff.getVersion() : 'N/A'}`);
        } else {
            addLog('❌ LIFF 物件不存在');
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
                        🔍 LINE 登入流程調試
                    </h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">isLiffReady</div>
                            <div className={`font-bold ${isLiffReady ? 'text-green-600' : 'text-red-600'}`}>
                                {isLiffReady ? '✅ True' : '❌ False'}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">isLoggedIn</div>
                            <div className={`font-bold ${isLoggedIn ? 'text-green-600' : 'text-red-600'}`}>
                                {isLoggedIn ? '✅ True' : '❌ False'}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">authLoading</div>
                            <div className={`font-bold ${authLoading ? 'text-yellow-600' : 'text-gray-600'}`}>
                                {authLoading ? '⏳ True' : '✅ False'}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">authError</div>
                            <div className={`font-bold ${authError ? 'text-red-600' : 'text-green-600'}`}>
                                {authError ? '❌ Error' : '✅ None'}
                            </div>
                        </div>
                    </div>

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                            <h3 className="font-medium text-red-800 mb-2">❌ 錯誤詳情</h3>
                            <p className="text-red-700 text-sm font-mono">{authError}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <button
                            onClick={testLogin}
                            disabled={authLoading || !isLiffReady}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
                        >
                            測試登入
                        </button>
                        
                        <button
                            onClick={testApiCall}
                            disabled={!liffProfile}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
                        >
                            測試 API 調用
                        </button>
                        
                        <button
                            onClick={checkLiffStatus}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                            檢查 LIFF 狀態
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded">
                        <h3 className="font-medium mb-2">狀態資訊</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>LIFF Profile:</strong> {liffProfile ? `${liffProfile.displayName} (${liffProfile.userId})` : '無'}</p>
                            <p><strong>User Profile:</strong> {userProfile ? `${userProfile.memberName} (${userProfile.team})` : '無'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 調試日誌
                    </h2>
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">等待日誌...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                    <h3 className="font-medium text-blue-800 mb-2">💡 說明</h3>
                    <p className="text-blue-700 text-sm">
                        這個頁面會詳細記錄 LINE 登入流程的每個步驟，幫助找出 400 Bad Request 錯誤的原因。
                        請點擊 "測試登入" 按鈕並觀察日誌輸出。
                    </p>
                </div>
            </div>
        </div>
    );
}
