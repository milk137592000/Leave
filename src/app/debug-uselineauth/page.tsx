'use client';

import { useEffect, useState } from 'react';
import { useLineAuth } from '@/hooks/useLineAuth';

export default function DebugUseLineAuthPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    // 使用 useLineAuth hook（和請假頁面一樣）
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

        addLog('=== 開始 useLineAuth 調試 ===');
        addLog(`當前 URL: ${window.location.href}`);
        addLog(`域名: ${window.location.hostname}`);
        addLog(`協議: ${window.location.protocol}`);
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
            addLog(`✅ liffProfile 獲取成功: ${liffProfile.displayName}`);
        }
    }, [liffProfile]);

    useEffect(() => {
        if (userProfile) {
            addLog(`✅ userProfile 獲取成功: ${userProfile.memberName}`);
        }
    }, [userProfile]);

    if (!isClient) {
        return <div className="p-8">載入中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🐛 useLineAuth Hook 調試
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

                    <div className="mb-4">
                        <button
                            onClick={login}
                            disabled={authLoading || !isLiffReady}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            測試登入
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
                        這個頁面使用和請假頁面完全相同的 useLineAuth hook，可以幫助調試 LIFF 初始化問題。
                        如果這個頁面工作正常但請假頁面不行，可能是緩存問題。
                    </p>
                </div>
            </div>
        </div>
    );
}
