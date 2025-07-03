'use client';

import { useEffect, useState } from 'react';

export default function LiffFixTestPage() {
    const [isClient, setIsClient] = useState(false);
    const [status, setStatus] = useState('初始化中...');
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState('');

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

        const testLiffFix = async () => {
            try {
                addLog('=== 開始 LIFF 修復測試 ===');
                
                // 檢查環境
                addLog(`當前 URL: ${window.location.href}`);
                addLog(`User Agent: ${navigator.userAgent}`);
                addLog(`是否在 LINE 中: ${navigator.userAgent.includes('Line')}`);
                
                // 載入 LIFF SDK
                addLog('載入 LIFF SDK...');
                if (!(window as any).liff) {
                    const script = document.createElement('script');
                    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                    
                    await new Promise((resolve, reject) => {
                        script.onload = () => {
                            addLog('✅ LIFF SDK 載入成功');
                            resolve(true);
                        };
                        script.onerror = (err) => {
                            addLog('❌ LIFF SDK 載入失敗');
                            reject(err);
                        };
                        document.head.appendChild(script);
                    });
                } else {
                    addLog('LIFF SDK 已存在');
                }

                // 測試 LIFF 初始化
                const liffId = '2007680034-QnRpBayW';
                addLog(`使用 LIFF ID: ${liffId}`);
                addLog(`LIFF ID 類型: ${typeof liffId}`);
                addLog(`LIFF ID 長度: ${liffId.length}`);

                // 檢查 LIFF 物件
                if ((window as any).liff) {
                    addLog('LIFF 物件存在，檢查方法...');
                    addLog(`liff.init 類型: ${typeof (window as any).liff.init}`);
                    addLog(`liff.isInClient 類型: ${typeof (window as any).liff.isInClient}`);
                } else {
                    throw new Error('LIFF 物件不存在');
                }

                // 嘗試初始化
                addLog('開始初始化 LIFF...');
                
                if ((window as any).liff.isInClient === undefined) {
                    addLog('LIFF 尚未初始化，開始初始化...');
                    
                    // 方法1: 標準初始化
                    try {
                        addLog('嘗試標準初始化方法...');
                        await (window as any).liff.init({ liffId: liffId });
                        addLog('✅ 標準初始化成功');
                    } catch (error1) {
                        addLog(`❌ 標準初始化失敗: ${error1}`);
                        
                        // 方法2: 字串參數
                        try {
                            addLog('嘗試字串參數初始化...');
                            await (window as any).liff.init(liffId);
                            addLog('✅ 字串參數初始化成功');
                        } catch (error2) {
                            addLog(`❌ 字串參數初始化失敗: ${error2}`);
                            throw error2;
                        }
                    }
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
                addLog(`❌ 測試失敗: ${errorMessage}`);
                setError(errorMessage);
                setStatus('測試失敗');
            }
        };

        testLiffFix();
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
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🔧 LIFF 修復測試頁面
                    </h1>
                    
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">
                            狀態: <span className={status === '初始化成功' ? 'text-green-600' : status === '測試失敗' ? 'text-red-600' : 'text-yellow-600'}>
                                {status}
                            </span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-medium text-gray-900 mb-2">測試資訊</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>LIFF ID:</strong> 2007680034-QnRpBayW</p>
                                <p><strong>當前 URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                                <p><strong>測試時間:</strong> {new Date().toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-medium text-gray-900 mb-2">修復內容</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• 增強 LIFF ID 驗證</p>
                                <p>• 多種初始化方法</p>
                                <p>• 詳細錯誤日誌</p>
                                <p>• 變數衝突防護</p>
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
                        📋 測試日誌 ({logs.length} 條)
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
                        <p>💡 提示：這個頁面測試了修復後的 LIFF 初始化邏輯</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
