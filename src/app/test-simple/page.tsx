'use client';

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
    const [isClient, setIsClient] = useState(false);
    const [info, setInfo] = useState<string>('載入中...');

    useEffect(() => {
        setIsClient(true);
        
        if (typeof window !== 'undefined') {
            const testInfo = {
                url: window.location.href,
                hostname: window.location.hostname,
                protocol: window.location.protocol,
                userAgent: navigator?.userAgent || 'N/A',
                liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW',
                timestamp: new Date().toISOString()
            };
            
            setInfo(JSON.stringify(testInfo, null, 2));
        }
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 簡單測試頁面
                    </h1>
                    
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-3">✅ 頁面載入成功</h2>
                        <p className="text-gray-600">
                            如果您看到這個頁面，表示 SSR 問題已經解決。
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium mb-2">📊 基本資訊</h3>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {info}
                        </pre>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                const liffUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW'}`;
                                if (navigator?.clipboard) {
                                    navigator.clipboard.writeText(liffUrl);
                                    alert('LIFF 連結已複製');
                                } else {
                                    alert(`LIFF 連結: ${liffUrl}`);
                                }
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            📋 複製 LIFF 連結
                        </button>

                        <button
                            onClick={() => {
                                window.location.href = '/line-setup';
                            }}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                        >
                            🔗 前往 LINE 設定頁面
                        </button>

                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            🔄 重新載入
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        <p>如果這個頁面正常運作，但 line-setup 頁面仍有問題，請告知具體錯誤訊息。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
