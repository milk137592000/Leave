'use client';

import { useState, useEffect } from 'react';

export default function LiffSafeTestPage() {
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

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW';
    const currentDomain = window.location.hostname;
    const currentUrl = window.location.href;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🔗 LIFF 連結測試
                    </h1>

                    <div className="space-y-6">
                        {/* 當前配置 */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-3">📋 當前配置</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>LIFF ID:</strong> {liffId}</div>
                                <div><strong>當前域名:</strong> {currentDomain}</div>
                                <div><strong>當前頁面:</strong> {currentUrl}</div>
                            </div>
                        </div>

                        {/* 測試連結 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">🧪 測試連結</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">原始 LINE 設定頁面:</p>
                                    <code className="text-xs bg-white p-2 rounded block break-all">
                                        https://liff.line.me/{liffId}
                                    </code>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">安全版本頁面:</p>
                                    <code className="text-xs bg-white p-2 rounded block break-all">
                                        https://liff.line.me/{liffId}?endpoint=/line-setup-safe
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* 操作按鈕 */}
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    const url = `https://liff.line.me/${liffId}`;
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(url);
                                        alert('原始 LIFF 連結已複製');
                                    } else {
                                        alert(`原始 LIFF 連結: ${url}`);
                                    }
                                }}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                📋 複製原始 LIFF 連結
                            </button>

                            <button
                                onClick={() => {
                                    window.location.href = '/line-setup-safe';
                                }}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                            >
                                🔗 直接測試安全版本
                            </button>

                            <button
                                onClick={() => {
                                    window.location.href = '/line-setup';
                                }}
                                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                            >
                                ⚠️ 測試原始版本（可能有錯誤）
                            </button>
                        </div>

                        {/* 說明 */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-800 mb-2">📝 測試說明</h3>
                            <div className="text-yellow-700 text-sm space-y-1">
                                <p>1. 先測試「直接測試安全版本」按鈕</p>
                                <p>2. 如果安全版本正常，複製 LIFF 連結在 LINE 中測試</p>
                                <p>3. 如果需要，可以在 LINE Developers Console 中更新端點</p>
                            </div>
                        </div>

                        {/* 調試資訊 */}
                        <details className="bg-gray-50 rounded-lg p-4">
                            <summary className="cursor-pointer font-medium text-gray-900">
                                🔍 調試資訊
                            </summary>
                            <div className="mt-3 text-sm text-gray-600">
                                <pre className="bg-white p-3 rounded text-xs overflow-auto">
{JSON.stringify({
    liffId,
    currentDomain,
    currentUrl,
    userAgent: navigator.userAgent,
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
