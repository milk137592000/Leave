'use client';

import { useEffect, useState } from 'react';

export default function LineUltimateTestPage() {
    const [isClient, setIsClient] = useState(false);
    const [status, setStatus] = useState('初始化中...');
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState('');

    // 強制硬編碼 LIFF ID - 2025-01-03 最終版本
    const LIFF_ID = '2007680034-QnRpBayW';

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const initLiff = async () => {
            try {
                addLog('=== 開始 LIFF 最終測試 ===');
                addLog(`硬編碼 LIFF ID: ${LIFF_ID}`);
                addLog(`LIFF ID 長度: ${LIFF_ID.length}`);
                addLog(`LIFF ID 類型: ${typeof LIFF_ID}`);
                addLog(`LIFF ID 格式檢查: ${/^\d{10}-[a-zA-Z0-9]{8}$/.test(LIFF_ID)}`);
                
                // 檢查環境
                addLog(`當前 URL: ${window.location.href}`);
                addLog(`User Agent: ${navigator.userAgent}`);
                addLog(`是否在 LINE 中: ${navigator.userAgent.includes('Line')}`);

                // 載入 LIFF SDK
                if (!(window as any).liff) {
                    addLog('載入 LIFF SDK...');
                    const script = document.createElement('script');
                    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                    
                    await new Promise((resolve, reject) => {
                        script.onload = () => {
                            addLog('✅ LIFF SDK 載入成功');
                            resolve(true);
                        };
                        script.onerror = () => {
                            addLog('❌ LIFF SDK 載入失敗');
                            reject(new Error('LIFF SDK 載入失敗'));
                        };
                        document.head.appendChild(script);
                    });
                } else {
                    addLog('LIFF SDK 已存在');
                }

                // 檢查 LIFF 物件
                addLog(`LIFF 物件存在: ${!!(window as any).liff}`);
                if ((window as any).liff) {
                    addLog(`LIFF 物件類型: ${typeof (window as any).liff}`);
                    addLog(`LIFF init 方法存在: ${typeof (window as any).liff.init === 'function'}`);
                }

                // 驗證 LIFF ID
                if (!LIFF_ID || typeof LIFF_ID !== 'string' || LIFF_ID.trim() === '') {
                    throw new Error(`LIFF ID 無效: "${LIFF_ID}"`);
                }

                // 初始化 LIFF
                addLog('開始初始化 LIFF...');
                addLog(`調用 liff.init({ liffId: "${LIFF_ID}" })`);
                
                // 檢查是否已經初始化
                if ((window as any).liff.isInClient === undefined) {
                    await (window as any).liff.init({ liffId: LIFF_ID });
                    addLog('✅ LIFF 初始化成功！');
                } else {
                    addLog('LIFF 已經初始化過');
                }
                
                setStatus('初始化成功');

                // 檢查狀態
                const isInClient = (window as any).liff.isInClient();
                const isLoggedIn = (window as any).liff.isLoggedIn();
                
                addLog(`在 LINE 客戶端中: ${isInClient}`);
                addLog(`已登入: ${isLoggedIn}`);

                if (isLoggedIn) {
                    try {
                        const profile = await (window as any).liff.getProfile();
                        addLog(`用戶名稱: ${profile.displayName}`);
                        addLog(`用戶 ID: ${profile.userId}`);
                    } catch (profileError) {
                        addLog(`獲取用戶資料失敗: ${profileError}`);
                    }
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                addLog(`❌ 初始化失敗: ${errorMessage}`);
                addLog(`錯誤堆疊: ${err instanceof Error ? err.stack : 'N/A'}`);
                setError(errorMessage);
                setStatus('初始化失敗');
            }
        };

        initLiff();
    }, [isClient]);

    const handleLogin = async () => {
        try {
            addLog('開始登入...');
            if ((window as any).liff) {
                addLog('調用 liff.login()...');
                await (window as any).liff.login();
                addLog('登入請求已發送');
            } else {
                addLog('❌ LIFF 未初始化');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            addLog(`❌ 登入失敗: ${errorMessage}`);
        }
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🚀 LINE LIFF 最終測試版本
                    </h1>
                    
                    <div className="mb-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            status === '初始化成功' ? 'bg-green-100 text-green-800' :
                            status === '初始化失敗' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {status}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-medium text-gray-900 mb-2">配置資訊</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>硬編碼 LIFF ID:</strong> {LIFF_ID}</p>
                                <p><strong>環境變數:</strong> {process.env.NEXT_PUBLIC_LIFF_ID || '未設定'}</p>
                                <p><strong>當前 URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                                <p><strong>LIFF URL:</strong> https://liff.line.me/{LIFF_ID}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-medium text-gray-900 mb-2">操作</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleLogin}
                                    disabled={status !== '初始化成功'}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                >
                                    🔐 測試登入
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                                >
                                    🔄 重新載入
                                </button>
                                <a
                                    href={`https://liff.line.me/${LIFF_ID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
                                >
                                    📱 在 LINE 中開啟
                                </a>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                            <h3 className="font-medium text-red-800 mb-2">❌ 錯誤詳情</h3>
                            <p className="text-red-700 text-sm font-mono">{error}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 詳細日誌 ({logs.length} 條)
                    </h2>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
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
                    
                    <div className="mt-4 text-xs text-gray-500">
                        <p>💡 提示：如果仍然出現錯誤，請檢查瀏覽器控制台的完整錯誤訊息</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
