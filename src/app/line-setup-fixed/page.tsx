'use client';

import { useEffect, useState } from 'react';

export default function LineSetupFixedPage() {
    const [isClient, setIsClient] = useState(false);
    const [isLiffReady, setIsLiffReady] = useState(false);
    const [liffProfile, setLiffProfile] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>({});

    // 強制使用硬編碼的 LIFF ID
    const HARDCODED_LIFF_ID = '2007680034-QnRpBayW';

    // 確保只在客戶端執行
    useEffect(() => {
        setIsClient(true);
    }, []);

    // LIFF 初始化
    useEffect(() => {
        if (!isClient) return;

        const initLiff = async () => {
            try {
                console.log('=== LIFF 初始化開始 ===');
                
                // 調試資訊
                const debug = {
                    envVar: process.env.NEXT_PUBLIC_LIFF_ID,
                    hardcoded: HARDCODED_LIFF_ID,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                setDebugInfo(debug);
                console.log('調試資訊:', debug);
                
                // 檢查是否已載入 LIFF SDK
                if (!(window as any).liff) {
                    console.log('載入 LIFF SDK...');
                    const script = document.createElement('script');
                    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                    console.log('LIFF SDK 載入完成');
                }

                // 強制使用硬編碼 LIFF ID
                const liffId = HARDCODED_LIFF_ID;
                console.log('使用 LIFF ID:', liffId);
                console.log('LIFF ID 長度:', liffId.length);
                console.log('LIFF ID 類型:', typeof liffId);

                // 驗證 LIFF ID 格式
                if (!liffId || typeof liffId !== 'string' || liffId.length === 0) {
                    throw new Error(`LIFF ID 無效: "${liffId}"`);
                }

                // 初始化 LIFF
                console.log('開始初始化 LIFF...');
                if ((window as any).liff.isInClient === undefined) {
                    console.log('調用 liff.init，參數:', { liffId });
                    await (window as any).liff.init({ liffId: liffId });
                    console.log('LIFF 初始化成功');
                } else {
                    console.log('LIFF 已經初始化過');
                }

                setIsLiffReady(true);
                console.log('=== LIFF 初始化完成 ===');

                // 檢查登入狀態
                if ((window as any).liff.isLoggedIn()) {
                    const profile = await (window as any).liff.getProfile();
                    setLiffProfile(profile);
                    console.log('用戶已登入:', profile);
                } else {
                    console.log('用戶未登入');
                }

            } catch (err) {
                console.error('=== LIFF 初始化失敗 ===');
                console.error('錯誤詳情:', err);
                console.error('錯誤類型:', typeof err);
                console.error('錯誤訊息:', err instanceof Error ? err.message : String(err));
                setError(`初始化失敗: ${err instanceof Error ? err.message : String(err)}`);
            }
        };

        initLiff();
    }, [isClient]);

    const handleLogin = async () => {
        if (!isClient || !(window as any).liff) {
            setError('LIFF 未準備好');
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log('=== 開始登入 ===');
            
            // 強制使用硬編碼 LIFF ID
            const liffId = HARDCODED_LIFF_ID;
            console.log('登入使用的 LIFF ID:', liffId);
            
            // 檢查 LIFF 狀態
            console.log('LIFF 物件:', (window as any).liff);
            console.log('isInClient:', (window as any).liff.isInClient());
            console.log('isLoggedIn:', (window as any).liff.isLoggedIn());
            
            // 使用最簡單的登入方式
            console.log('調用 liff.login()...');
            await (window as any).liff.login();
            
        } catch (err) {
            console.error('=== 登入失敗 ===');
            console.error('錯誤詳情:', err);
            setError(`登入失敗: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    // 服務器端渲染時顯示載入中
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

    // LIFF 初始化中
    if (!isLiffReady) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
                    {error ? (
                        <div className="text-red-600">
                            <h2 className="text-lg font-medium mb-2">初始化失敗</h2>
                            <p className="text-sm mb-4">{error}</p>
                            
                            {/* 調試資訊 */}
                            <div className="bg-gray-50 p-3 rounded text-left text-xs mb-4">
                                <p><strong>調試資訊:</strong></p>
                                <p>環境變數: {debugInfo.envVar || '未設定'}</p>
                                <p>硬編碼值: {debugInfo.hardcoded}</p>
                                <p>當前 URL: {debugInfo.url}</p>
                            </div>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                重新載入
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">正在初始化 LINE 登入...</p>
                            <p className="text-xs text-gray-400 mt-2">使用 LIFF ID: {HARDCODED_LIFF_ID}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 用戶已登入，顯示資訊
    if (liffProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">登入成功！</h2>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600">LINE 用戶：</p>
                        <p className="font-medium">{liffProfile.displayName}</p>
                        <p className="text-xs text-gray-500 mt-1">User ID: {liffProfile.userId}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        登入成功！現在可以進行身份設定。
                    </p>
                    <button
                        onClick={() => {
                            if ((window as any).liff?.closeWindow) {
                                (window as any).liff.closeWindow();
                            }
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        關閉視窗
                    </button>
                </div>
            </div>
        );
    }

    // 顯示登入按鈕
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-6">
                    LINE 身份設定 (修復版)
                </h1>

                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-4">
                        請先登入您的 LINE 帳號。
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                    {loading ? '登入中...' : '🔐 使用 LINE 登入'}
                </button>

                <div className="mt-4 text-xs text-gray-400">
                    <p>點擊後將跳轉到 LINE 登入頁面</p>
                    <div className="mt-2 bg-gray-50 p-2 rounded text-left">
                        <p>調試資訊：</p>
                        <p>LIFF ID: {HARDCODED_LIFF_ID}</p>
                        <p>環境變數: {debugInfo.envVar || '未設定'}</p>
                        <p>LIFF 狀態: {(window as any).liff ? '已載入' : '未載入'}</p>
                        <p>在 LINE 中: {(window as any).liff?.isInClient?.() ? '是' : '否'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
