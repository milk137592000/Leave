'use client';

import { useEffect, useState } from 'react';

export default function ClearLiffStoragePage() {
    const [cleared, setCleared] = useState(false);
    const [storageInfo, setStorageInfo] = useState<any>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 收集當前儲存狀態
        const info = {
            localStorage: {
                all: Object.keys(localStorage),
                liffKeys: Object.keys(localStorage).filter(key => key.toLowerCase().includes('liff')),
                oauthKeys: Object.keys(localStorage).filter(key => 
                    key.toLowerCase().includes('code') || 
                    key.toLowerCase().includes('state') || 
                    key.toLowerCase().includes('verifier')
                )
            },
            sessionStorage: {
                all: Object.keys(sessionStorage),
                liffKeys: Object.keys(sessionStorage).filter(key => key.toLowerCase().includes('liff')),
                oauthKeys: Object.keys(sessionStorage).filter(key => 
                    key.toLowerCase().includes('code') || 
                    key.toLowerCase().includes('state') || 
                    key.toLowerCase().includes('verifier')
                )
            }
        };

        setStorageInfo(info);
    }, []);

    const clearAllLiffStorage = () => {
        if (typeof window === 'undefined') return;

        const keysToRemove = [
            // LIFF 相關的 keys
            'liff_code_verifier',
            'liff_state',
            'liff_access_token',
            'liff_id_token',
            'liff_refresh_token',
            'liff_expires_in',
            'liff_scope',
            'liff_token_type',
            // OAuth 相關的 keys
            'oauth_code_verifier',
            'oauth_state',
            'pkce_code_verifier',
            'pkce_state',
            // LINE 相關的 keys
            'line_access_token',
            'line_id_token',
            'line_refresh_token'
        ];

        let removedCount = 0;

        // 清除 localStorage
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                removedCount++;
            }
        });

        // 清除 sessionStorage
        keysToRemove.forEach(key => {
            if (sessionStorage.getItem(key)) {
                sessionStorage.removeItem(key);
                removedCount++;
            }
        });

        // 清除所有包含 'liff' 的 keys
        Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('liff')) {
                localStorage.removeItem(key);
                removedCount++;
            }
        });

        Object.keys(sessionStorage).forEach(key => {
            if (key.toLowerCase().includes('liff')) {
                sessionStorage.removeItem(key);
                removedCount++;
            }
        });

        console.log(`清除了 ${removedCount} 個儲存項目`);
        setCleared(true);

        // 更新儲存資訊
        const info = {
            localStorage: {
                all: Object.keys(localStorage),
                liffKeys: Object.keys(localStorage).filter(key => key.toLowerCase().includes('liff')),
                oauthKeys: Object.keys(localStorage).filter(key => 
                    key.toLowerCase().includes('code') || 
                    key.toLowerCase().includes('state') || 
                    key.toLowerCase().includes('verifier')
                )
            },
            sessionStorage: {
                all: Object.keys(sessionStorage),
                liffKeys: Object.keys(sessionStorage).filter(key => key.toLowerCase().includes('liff')),
                oauthKeys: Object.keys(sessionStorage).filter(key => 
                    key.toLowerCase().includes('code') || 
                    key.toLowerCase().includes('state') || 
                    key.toLowerCase().includes('verifier')
                )
            }
        };

        setStorageInfo(info);
    };

    const goToLineSetup = () => {
        window.location.href = '/line-setup';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    清除 LIFF 儲存狀態
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        如果遇到 "code_verifier does not match" 錯誤，可能是因為瀏覽器儲存的 OAuth 狀態與 LINE 服務器不匹配。
                        點擊下方按鈕清除所有 LIFF 相關的儲存狀態，然後重新開始登入流程。
                    </p>
                </div>

                {cleared && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-800 font-medium">儲存狀態已清除</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                            現在可以重新嘗試 LINE 登入了
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={clearAllLiffStorage}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                        🗑️ 清除 LIFF 儲存狀態
                    </button>

                    <button
                        onClick={goToLineSetup}
                        disabled={!cleared}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        🔐 前往 LINE 設定頁面
                    </button>
                </div>

                {/* 儲存狀態資訊 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">當前儲存狀態</h3>
                    <div className="text-xs text-gray-600">
                        <div className="mb-2">
                            <strong>localStorage LIFF keys:</strong> {storageInfo.localStorage?.liffKeys?.length || 0}
                            {storageInfo.localStorage?.liffKeys?.length > 0 && (
                                <div className="ml-2 text-gray-500">
                                    {storageInfo.localStorage.liffKeys.join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <strong>sessionStorage LIFF keys:</strong> {storageInfo.sessionStorage?.liffKeys?.length || 0}
                            {storageInfo.sessionStorage?.liffKeys?.length > 0 && (
                                <div className="ml-2 text-gray-500">
                                    {storageInfo.sessionStorage.liffKeys.join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <strong>localStorage OAuth keys:</strong> {storageInfo.localStorage?.oauthKeys?.length || 0}
                            {storageInfo.localStorage?.oauthKeys?.length > 0 && (
                                <div className="ml-2 text-gray-500">
                                    {storageInfo.localStorage.oauthKeys.join(', ')}
                                </div>
                            )}
                        </div>
                        <div>
                            <strong>sessionStorage OAuth keys:</strong> {storageInfo.sessionStorage?.oauthKeys?.length || 0}
                            {storageInfo.sessionStorage?.oauthKeys?.length > 0 && (
                                <div className="ml-2 text-gray-500">
                                    {storageInfo.sessionStorage.oauthKeys.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <a 
                        href="/liff-debug" 
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                        查看詳細調試資訊
                    </a>
                </div>
            </div>
        </div>
    );
}
