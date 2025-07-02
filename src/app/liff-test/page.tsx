'use client';

import { useEffect, useState } from 'react';

export default function LiffTestPage() {
    const [liffId, setLiffId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // 檢查環境變數
        const id = process.env.NEXT_PUBLIC_LIFF_ID;
        if (id) {
            setLiffId(id);
        } else {
            setError('NEXT_PUBLIC_LIFF_ID 未設定');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        LIFF 設定測試
                    </h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LIFF ID
                            </label>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <code className="text-sm">
                                    {liffId || '未設定'}
                                </code>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LIFF URL
                            </label>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <code className="text-sm break-all">
                                    {liffId ? `https://liff.line.me/${liffId}` : '無法產生'}
                                </code>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    if (liffId) {
                                        navigator.clipboard.writeText(`https://liff.line.me/${liffId}`);
                                        alert('LIFF URL 已複製到剪貼簿');
                                    }
                                }}
                                disabled={!liffId}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                複製 LIFF URL
                            </button>

                            <button
                                onClick={() => {
                                    window.location.href = '/line-setup';
                                }}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                            >
                                前往身份設定頁面
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
