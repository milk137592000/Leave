'use client';

import { useState, useEffect } from 'react';

export default function LiffQRPage() {
    const [liffUrl, setLiffUrl] = useState('');

    useEffect(() => {
        const url = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW'}`;
        setLiffUrl(url);
    }, []);

    const generateQRCode = (text: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        📱 LINE LIFF 應用程式測試
                    </h1>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">🔗 LIFF 連結</h2>
                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                            <code className="text-sm break-all">{liffUrl}</code>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(liffUrl);
                                alert('連結已複製！請在 LINE 中貼上並點擊');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            📋 複製連結
                        </button>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">📱 QR Code 掃描</h2>
                        <div className="flex justify-center mb-4">
                            <img 
                                src={generateQRCode(liffUrl)} 
                                alt="LIFF QR Code"
                                className="border rounded-lg"
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            使用 LINE 掃描此 QR Code 開啟應用程式
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-yellow-800 mb-2">⚠️ 重要提醒</h3>
                        <div className="text-yellow-700 text-sm text-left">
                            <p className="mb-2"><strong>LIFF 應用程式必須在 LINE 中開啟：</strong></p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>不能在一般瀏覽器中直接開啟</li>
                                <li>必須透過 LINE 應用程式內建瀏覽器</li>
                                <li>可以複製連結到 LINE 聊天室中點擊</li>
                                <li>或使用 LINE 掃描 QR Code</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">📋 測試步驟</h3>
                        <div className="text-blue-700 text-sm text-left">
                            <ol className="list-decimal list-inside space-y-1">
                                <li>複製上方的 LIFF 連結</li>
                                <li>開啟 LINE 應用程式</li>
                                <li>找一個聊天室（可以是自己的記事本）</li>
                                <li>貼上連結並點擊</li>
                                <li>應該會開啟身份設定頁面</li>
                            </ol>
                        </div>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        <p>LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW'}</p>
                        <p>Endpoint: https://leave-ten.vercel.app/line-setup</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
