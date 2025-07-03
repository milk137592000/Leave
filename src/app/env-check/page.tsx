'use client';

import { useEffect, useState } from 'react';

export default function EnvCheckPage() {
    const [envInfo, setEnvInfo] = useState<any>({});

    useEffect(() => {
        const info = {
            NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
            NODE_ENV: process.env.NODE_ENV,
            // 檢查是否在客戶端
            isClient: typeof window !== 'undefined',
            // 檢查 window 物件
            hasWindow: typeof window !== 'undefined',
            // 當前 URL
            currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
            // 時間戳
            timestamp: new Date().toISOString()
        };
        
        setEnvInfo(info);
        console.log('環境變數檢查:', info);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">環境變數檢查</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">環境變數資訊</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(envInfo, null, 2)}
                    </pre>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">診斷結果</h2>
                    <div className="space-y-2">
                        <div className={`p-3 rounded ${envInfo.NEXT_PUBLIC_LIFF_ID ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <strong>LIFF ID:</strong> {envInfo.NEXT_PUBLIC_LIFF_ID || '❌ 未設定'}
                        </div>
                        
                        <div className={`p-3 rounded ${envInfo.isClient ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <strong>客戶端環境:</strong> {envInfo.isClient ? '✅ 正常' : '❌ 異常'}
                        </div>
                        
                        <div className="p-3 rounded bg-blue-50 text-blue-800">
                            <strong>當前環境:</strong> {envInfo.NODE_ENV || 'unknown'}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">解決方案</h2>
                    {!envInfo.NEXT_PUBLIC_LIFF_ID ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                            <h3 className="font-medium text-yellow-800 mb-2">LIFF ID 未設定</h3>
                            <p className="text-yellow-700 mb-3">請按照以下步驟設定：</p>
                            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                                <li>前往 Vercel Dashboard</li>
                                <li>選擇您的專案</li>
                                <li>進入 Settings → Environment Variables</li>
                                <li>添加變數：<code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_LIFF_ID</code></li>
                                <li>值設為：<code className="bg-yellow-100 px-1 rounded">2007680034-QnRpBayW</code></li>
                                <li>儲存並重新部署</li>
                            </ol>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <h3 className="font-medium text-green-800 mb-2">✅ 環境變數設定正確</h3>
                            <p className="text-green-700">LIFF ID 已正確設定，可以繼續使用 LINE 登入功能。</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
                    >
                        重新檢查
                    </button>
                    <a
                        href="/line-debug"
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        前往調試頁面
                    </a>
                </div>
            </div>
        </div>
    );
}
