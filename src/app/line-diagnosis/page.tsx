'use client';

import { useState, useEffect } from 'react';
import { useBrowserSafe } from '@/hooks/useBrowserSafe';

export default function LineDiagnosisPage() {
    const [diagnostics, setDiagnostics] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const { isClient, window: safeWindow } = useBrowserSafe();

    useEffect(() => {
        if (!isClient) return;

        const runDiagnostics = () => {
            const results = {
                // 環境檢查
                environment: {
                    isClient: isClient,
                    currentUrl: safeWindow?.location.href || 'N/A',
                    origin: safeWindow?.location.origin || 'N/A',
                    userAgent: navigator?.userAgent || 'N/A',
                    isInLineApp: navigator?.userAgent.includes('Line') || false,
                },
                
                // 環境變數檢查
                envVars: {
                    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID || '未設定',
                    NODE_ENV: process.env.NODE_ENV || '未知',
                },
                
                // LIFF 配置檢查
                liffConfig: {
                    expectedLiffId: '2007680034-QnRpBayW',
                    actualLiffId: process.env.NEXT_PUBLIC_LIFF_ID,
                    liffUrl: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || 'NOT_SET'}`,
                    isCorrect: process.env.NEXT_PUBLIC_LIFF_ID === '2007680034-QnRpBayW',
                },
                
                // 域名檢查
                domainCheck: {
                    currentDomain: safeWindow?.location.hostname || 'N/A',
                    expectedDomain: 'leave-ten.vercel.app',
                    isProduction: safeWindow?.location.hostname === 'leave-ten.vercel.app',
                    isLocalhost: safeWindow?.location.hostname === 'localhost',
                },
                
                // LIFF SDK 檢查
                liffSdk: {
                    isLoaded: !!(safeWindow && safeWindow.liff),
                    version: safeWindow?.liff?.getVersion?.() || 'N/A',
                },
                
                timestamp: new Date().toISOString(),
            };
            
            setDiagnostics(results);
            setIsLoading(false);
            console.log('LINE 診斷結果:', results);
        };

        runDiagnostics();
    }, [isClient, safeWindow]);

    const testLiffInit = async () => {
        if (!isClient || !safeWindow) {
            alert('只能在瀏覽器環境中測試');
            return;
        }

        try {
            // 載入 LIFF SDK
            if (!safeWindow.liff) {
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                script.onload = async () => {
                    await initLiff();
                };
                script.onerror = () => {
                    alert('LIFF SDK 載入失敗');
                };
                document.head.appendChild(script);
            } else {
                await initLiff();
            }
        } catch (error) {
            alert(`LIFF 測試失敗: ${error}`);
        }
    };

    const initLiff = async () => {
        if (!safeWindow?.liff) return;

        try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW';
            await safeWindow.liff.init({ liffId });
            alert('✅ LIFF 初始化成功！');
        } catch (error: any) {
            alert(`❌ LIFF 初始化失敗: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>正在診斷 LINE 配置...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🔧 LINE 配置診斷
                    </h1>

                    {/* 總體狀態 */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">📊 總體狀態</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-lg ${diagnostics.liffConfig?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <h3 className="font-medium">LIFF ID 配置</h3>
                                <p className={diagnostics.liffConfig?.isCorrect ? 'text-green-800' : 'text-red-800'}>
                                    {diagnostics.liffConfig?.isCorrect ? '✅ 正確' : '❌ 錯誤'}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg ${diagnostics.domainCheck?.isProduction ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <h3 className="font-medium">域名環境</h3>
                                <p className={diagnostics.domainCheck?.isProduction ? 'text-green-800' : 'text-yellow-800'}>
                                    {diagnostics.domainCheck?.isProduction ? '✅ 生產環境' : '⚠️ 非生產環境'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 詳細診斷 */}
                    <div className="space-y-6">
                        {/* 環境檢查 */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">🌐 環境檢查</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <strong>當前 URL:</strong> {diagnostics.environment?.currentUrl}
                                    </div>
                                    <div>
                                        <strong>域名:</strong> {diagnostics.domainCheck?.currentDomain}
                                    </div>
                                    <div>
                                        <strong>是否在 LINE 中:</strong> {diagnostics.environment?.isInLineApp ? '✅ 是' : '❌ 否'}
                                    </div>
                                    <div>
                                        <strong>環境:</strong> {diagnostics.envVars?.NODE_ENV}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LIFF 配置 */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">🔗 LIFF 配置</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <strong>期望的 LIFF ID:</strong> {diagnostics.liffConfig?.expectedLiffId}
                                    </div>
                                    <div>
                                        <strong>實際的 LIFF ID:</strong> 
                                        <span className={diagnostics.liffConfig?.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                            {diagnostics.liffConfig?.actualLiffId}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>LIFF URL:</strong> {diagnostics.liffConfig?.liffUrl}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 問題診斷 */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">🚨 問題診斷</h2>
                            <div className="space-y-3">
                                {!diagnostics.liffConfig?.isCorrect && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h3 className="font-medium text-red-800 mb-2">❌ LIFF ID 配置錯誤</h3>
                                        <p className="text-red-700 text-sm">
                                            請檢查 Vercel 環境變數 NEXT_PUBLIC_LIFF_ID 是否設定為 2007680034-QnRpBayW
                                        </p>
                                    </div>
                                )}
                                
                                {!diagnostics.domainCheck?.isProduction && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-medium text-yellow-800 mb-2">⚠️ 非生產環境</h3>
                                        <p className="text-yellow-700 text-sm">
                                            當前不在生產域名 (leave-ten.vercel.app)，LIFF 可能無法正常運作
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 測試按鈕 */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">🧪 功能測試</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={testLiffInit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    測試 LIFF 初始化
                                </button>
                                
                                <button
                                    onClick={() => {
                                        const liffUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || '2007680034-QnRpBayW'}`;
                                        if (safeWindow) {
                                            safeWindow.open(liffUrl, '_blank');
                                        }
                                    }}
                                    className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    開啟 LIFF 應用程式
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 原始數據 */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-4">📋 原始診斷數據</h2>
                        <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                            <pre className="text-xs">
                                {JSON.stringify(diagnostics, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
