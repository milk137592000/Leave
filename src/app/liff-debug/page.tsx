'use client';

import { useEffect, useState } from 'react';

interface DebugInfo {
    timestamp?: string;
    userAgent?: string;
    currentUrl?: string;
    origin?: string;
    hostname?: string;
    protocol?: string;
    isHttps?: boolean;
    liffId?: string;
    expectedDomain?: string;
    expectedEndpoint?: string;
    isInLineApp?: boolean;
    liffSdkLoaded?: boolean;
    liffInitialized?: boolean;
    liffLoggedIn?: boolean;
    liffError?: string | null;
    userProfile?: {
        userId: string;
        displayName: string;
        pictureUrl?: string;
    };
    profileError?: string;
    // OAuth 相關
    isOAuthCallback?: boolean;
    oauthCode?: string | null;
    oauthState?: string | null;
    liffClientId?: string | null;
    liffRedirectUri?: string | null;
    localStorage?: {
        hasCodeVerifier: boolean;
        hasState: boolean;
        liffKeys: string[];
    };
    sessionStorage?: {
        hasCodeVerifier: boolean;
        hasState: boolean;
        liffKeys: string[];
    };
}

export default function LiffDebugPage() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
    const [liffStatus, setLiffStatus] = useState('檢查中...');

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined' || typeof navigator === 'undefined') {
            setLiffStatus('服務器端環境');
            return;
        }

        const checkLiffStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const info: DebugInfo = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                currentUrl: window.location.href,
                origin: window.location.origin,
                hostname: window.location.hostname,
                protocol: window.location.protocol,
                isHttps: window.location.protocol === 'https:',
                liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW',
                expectedDomain: 'leave-ten.vercel.app',
                expectedEndpoint: 'https://leave-ten.vercel.app/line-setup',
                isInLineApp: false,
                liffSdkLoaded: false,
                liffInitialized: false,
                liffLoggedIn: false,
                liffError: null,
                // OAuth 相關資訊
                isOAuthCallback: urlParams.has('code') && urlParams.has('state'),
                oauthCode: urlParams.get('code'),
                oauthState: urlParams.get('state'),
                liffClientId: urlParams.get('liffClientId'),
                liffRedirectUri: urlParams.get('liffRedirectUri'),
                // 儲存狀態檢查
                localStorage: {
                    hasCodeVerifier: !!localStorage.getItem('liff_code_verifier'),
                    hasState: !!localStorage.getItem('liff_state'),
                    liffKeys: Object.keys(localStorage).filter(key => key.includes('liff'))
                },
                sessionStorage: {
                    hasCodeVerifier: !!sessionStorage.getItem('liff_code_verifier'),
                    hasState: !!sessionStorage.getItem('liff_state'),
                    liffKeys: Object.keys(sessionStorage).filter(key => key.includes('liff'))
                }
            };

            // 檢查是否在 LINE 中
            info.isInLineApp = /Line/i.test(navigator.userAgent);

            try {
                // 嘗試載入 LIFF SDK
                if (!window.liff) {
                    const script = document.createElement('script');
                    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                info.liffSdkLoaded = !!window.liff;

                if (window.liff) {
                    // 嘗試初始化 LIFF
                    if (window.liff.isInClient === undefined) {
                        await window.liff.init({ liffId: info.liffId });
                    }
                    
                    info.liffInitialized = true;
                    info.isInLineApp = window.liff.isInClient();
                    info.liffLoggedIn = window.liff.isLoggedIn();
                    
                    if (info.liffLoggedIn) {
                        try {
                            const profile = await window.liff.getProfile();
                            info.userProfile = {
                                userId: profile.userId,
                                displayName: profile.displayName,
                                pictureUrl: profile.pictureUrl
                            };
                        } catch (error) {
                            info.profileError = error instanceof Error ? error.message : String(error);
                        }
                    }
                }

                setLiffStatus('檢查完成');
            } catch (error) {
                info.liffError = error instanceof Error ? error.message : String(error);
                setLiffStatus('檢查失敗');
            }

            setDebugInfo(info);
        };

        checkLiffStatus();
    }, []);

    const testLiffUrl = () => {
        if (typeof navigator === 'undefined') {
            alert('無法在服務器端執行此操作');
            return;
        }

        const liffUrl = `https://liff.line.me/${debugInfo.liffId}`;
        if (navigator.share) {
            navigator.share({
                title: 'LIFF 測試連結',
                url: liffUrl
            }).catch(() => {
                // 如果分享失敗，回退到複製
                navigator.clipboard?.writeText(liffUrl);
                alert('LIFF 連結已複製到剪貼板');
            });
        } else {
            navigator.clipboard?.writeText(liffUrl);
            alert('LIFF 連結已複製到剪貼板');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🔍 LIFF 配置診斷
                    </h1>

                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <span className="text-lg font-medium">狀態: </span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                                liffStatus === '檢查完成' ? 'bg-green-100 text-green-800' :
                                liffStatus === '檢查失敗' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {liffStatus}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 基本資訊 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">📱 環境資訊</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>當前網址:</strong> {debugInfo.currentUrl}</div>
                                <div><strong>域名:</strong> {debugInfo.hostname}</div>
                                <div><strong>協議:</strong> {debugInfo.protocol}</div>
                                <div><strong>HTTPS:</strong> {debugInfo.isHttps ? '✅' : '❌'}</div>
                                <div><strong>在 LINE 中:</strong> {debugInfo.isInLineApp ? '✅' : '❌'}</div>
                            </div>
                        </div>

                        {/* LIFF 配置 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">⚙️ LIFF 配置</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>LIFF ID:</strong> {debugInfo.liffId}</div>
                                <div><strong>預期域名:</strong> {debugInfo.expectedDomain}</div>
                                <div><strong>預期端點:</strong> {debugInfo.expectedEndpoint}</div>
                                <div><strong>域名匹配:</strong> {debugInfo.hostname === debugInfo.expectedDomain ? '✅' : '❌'}</div>
                            </div>
                        </div>

                        {/* LIFF 狀態 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3">🔧 LIFF 狀態</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>SDK 載入:</strong> {debugInfo.liffSdkLoaded ? '✅' : '❌'}</div>
                                <div><strong>已初始化:</strong> {debugInfo.liffInitialized ? '✅' : '❌'}</div>
                                <div><strong>已登入:</strong> {debugInfo.liffLoggedIn ? '✅' : '❌'}</div>
                                {debugInfo.liffError && (
                                    <div className="text-red-600"><strong>錯誤:</strong> {debugInfo.liffError}</div>
                                )}
                            </div>
                        </div>

                        {/* 用戶資訊 */}
                        {debugInfo.userProfile && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-3">👤 用戶資訊</h3>
                                <div className="space-y-2 text-sm">
                                    <div><strong>用戶 ID:</strong> {debugInfo.userProfile.userId}</div>
                                    <div><strong>顯示名稱:</strong> {debugInfo.userProfile.displayName}</div>
                                    {debugInfo.userProfile.pictureUrl && (
                                        <div><strong>頭像:</strong> 
                                            <img src={debugInfo.userProfile.pictureUrl} alt="頭像" className="w-8 h-8 rounded-full inline-block ml-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 測試按鈕 */}
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={testLiffUrl}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            📋 複製/分享 LIFF 測試連結
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            🔄 重新檢查
                        </button>
                    </div>

                    {/* 原始資料 */}
                    <details className="mt-6">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            📊 查看完整調試資料
                        </summary>
                        <pre className="mt-3 bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
    );
}
