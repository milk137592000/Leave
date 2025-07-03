'use client';

import { useState, useEffect } from 'react';

export default function EnvDebugPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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

    const envVars = {
        NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
        NODE_ENV: process.env.NODE_ENV,
        // 其他公開環境變數
    };

    const hardcodedLiffId = '2007680034-QnRpBayW';
    const actualLiffId = process.env.NEXT_PUBLIC_LIFF_ID || hardcodedLiffId;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🔍 環境變數診斷
                    </h1>

                    <div className="space-y-6">
                        {/* LIFF ID 狀態 */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-3">🎯 LIFF ID 狀態</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span><strong>環境變數值:</strong></span>
                                    <span className={envVars.NEXT_PUBLIC_LIFF_ID ? 'text-green-600' : 'text-red-600'}>
                                        {envVars.NEXT_PUBLIC_LIFF_ID || '❌ 未設定'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span><strong>硬編碼值:</strong></span>
                                    <span className="text-blue-600">{hardcodedLiffId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span><strong>實際使用值:</strong></span>
                                    <span className="text-purple-600 font-mono">{actualLiffId}</span>
                                </div>
                            </div>
                        </div>

                        {/* 所有環境變數 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">📋 所有公開環境變數</h3>
                            <div className="space-y-2 text-sm">
                                {Object.entries(envVars).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="font-mono text-gray-600">{key}:</span>
                                        <span className={value ? 'text-green-600' : 'text-red-600'}>
                                            {value || '❌ 未設定'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 問題診斷 */}
                        <div className={`rounded-lg p-4 ${envVars.NEXT_PUBLIC_LIFF_ID ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium mb-3 ${envVars.NEXT_PUBLIC_LIFF_ID ? 'text-green-900' : 'text-red-900'}`}>
                                {envVars.NEXT_PUBLIC_LIFF_ID ? '✅ 診斷結果' : '❌ 問題診斷'}
                            </h3>
                            <div className={`text-sm ${envVars.NEXT_PUBLIC_LIFF_ID ? 'text-green-700' : 'text-red-700'}`}>
                                {envVars.NEXT_PUBLIC_LIFF_ID ? (
                                    <div>
                                        <p>✅ NEXT_PUBLIC_LIFF_ID 已正確設定</p>
                                        <p>✅ LIFF 初始化應該可以正常運作</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p>❌ NEXT_PUBLIC_LIFF_ID 環境變數未設定</p>
                                        <p>🔧 目前使用硬編碼值: {hardcodedLiffId}</p>
                                        <p>⚠️ 需要在 Vercel Dashboard 中設定環境變數</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 修復步驟 */}
                        {!envVars.NEXT_PUBLIC_LIFF_ID && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-medium text-yellow-800 mb-3">🔧 修復步驟</h3>
                                <div className="text-yellow-700 text-sm space-y-2">
                                    <p><strong>1. 前往 Vercel Dashboard:</strong></p>
                                    <p className="ml-4">https://vercel.com/dashboard</p>
                                    
                                    <p><strong>2. 選擇您的專案 (leave-ten)</strong></p>
                                    
                                    <p><strong>3. 前往 Settings → Environment Variables</strong></p>
                                    
                                    <p><strong>4. 添加環境變數:</strong></p>
                                    <div className="ml-4 bg-white p-2 rounded font-mono text-xs">
                                        Name: NEXT_PUBLIC_LIFF_ID<br/>
                                        Value: {hardcodedLiffId}
                                    </div>
                                    
                                    <p><strong>5. 重新部署專案</strong></p>
                                </div>
                            </div>
                        )}

                        {/* 測試按鈕 */}
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    const liffUrl = `https://liff.line.me/${actualLiffId}`;
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(liffUrl);
                                        alert(`LIFF 連結已複製: ${liffUrl}`);
                                    } else {
                                        alert(`LIFF 連結: ${liffUrl}`);
                                    }
                                }}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                📋 複製 LIFF 連結 (使用當前值)
                            </button>

                            <button
                                onClick={() => {
                                    window.location.href = '/line-setup-safe';
                                }}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                            >
                                🧪 測試安全版本 LINE 設定
                            </button>

                            <button
                                onClick={() => {
                                    window.location.reload();
                                }}
                                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                🔄 重新檢查
                            </button>
                        </div>

                        {/* 調試資訊 */}
                        <details className="bg-gray-50 rounded-lg p-4">
                            <summary className="cursor-pointer font-medium text-gray-900">
                                🔍 完整調試資訊
                            </summary>
                            <div className="mt-3 text-sm text-gray-600">
                                <pre className="bg-white p-3 rounded text-xs overflow-auto">
{JSON.stringify({
    envVars,
    hardcodedLiffId,
    actualLiffId,
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
    timestamp: new Date().toISOString()
}, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
