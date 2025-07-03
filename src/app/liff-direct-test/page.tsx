'use client';

import { useEffect, useState } from 'react';

export default function LiffDirectTestPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [...prev, logMessage]);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const testLiffInit = async () => {
        try {
            addLog('=== 開始直接 LIFF 測試 ===');
            
            // 清除之前的日誌
            setLogs([]);
            
            // 檢查環境
            addLog(`當前 URL: ${window.location.href}`);
            addLog(`User Agent: ${navigator.userAgent}`);
            
            // 載入 LIFF SDK
            addLog('載入 LIFF SDK...');
            if (!(window as any).liff) {
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        addLog('✅ LIFF SDK 載入成功');
                        resolve(true);
                    };
                    script.onerror = (err) => {
                        addLog('❌ LIFF SDK 載入失敗');
                        reject(err);
                    };
                    document.head.appendChild(script);
                });
            } else {
                addLog('LIFF SDK 已存在');
            }

            // 檢查 LIFF 物件
            addLog(`LIFF 物件存在: ${!!(window as any).liff}`);
            addLog(`LIFF 類型: ${typeof (window as any).liff}`);
            
            if ((window as any).liff) {
                addLog(`LIFF.init 函數存在: ${typeof (window as any).liff.init}`);
                addLog(`LIFF.isInClient: ${(window as any).liff.isInClient}`);
            }

            // 準備 LIFF ID
            const liffId = '2007680034-QnRpBayW';
            addLog(`準備使用 LIFF ID: "${liffId}"`);
            addLog(`LIFF ID 類型: ${typeof liffId}`);
            addLog(`LIFF ID 長度: ${liffId.length}`);
            addLog(`LIFF ID 格式檢查: ${/^\d{10}-[a-zA-Z0-9]{8}$/.test(liffId)}`);

            // 測試不同的初始化方法
            addLog('=== 測試方法 1: 標準物件參數 ===');
            try {
                const config = { liffId: liffId };
                addLog(`初始化配置: ${JSON.stringify(config)}`);
                await (window as any).liff.init(config);
                addLog('✅ 方法 1 成功！');
                return;
            } catch (error1) {
                addLog(`❌ 方法 1 失敗: ${error1}`);
            }

            addLog('=== 測試方法 2: 直接字串參數 ===');
            try {
                addLog(`直接使用字串: "${liffId}"`);
                await (window as any).liff.init(liffId);
                addLog('✅ 方法 2 成功！');
                return;
            } catch (error2) {
                addLog(`❌ 方法 2 失敗: ${error2}`);
            }

            addLog('=== 測試方法 3: 重新創建配置物件 ===');
            try {
                const newConfig: any = {};
                newConfig.liffId = liffId;
                addLog(`新配置物件: ${JSON.stringify(newConfig)}`);
                await (window as any).liff.init(newConfig);
                addLog('✅ 方法 3 成功！');
                return;
            } catch (error3) {
                addLog(`❌ 方法 3 失敗: ${error3}`);
            }

            addLog('=== 測試方法 4: 使用 Object.create ===');
            try {
                const objConfig = Object.create(null);
                objConfig.liffId = liffId;
                addLog(`Object.create 配置: ${JSON.stringify(objConfig)}`);
                await (window as any).liff.init(objConfig);
                addLog('✅ 方法 4 成功！');
                return;
            } catch (error4) {
                addLog(`❌ 方法 4 失敗: ${error4}`);
            }

            addLog('❌ 所有初始化方法都失敗');

        } catch (error) {
            addLog(`❌ 測試過程中發生錯誤: ${error}`);
        }
    };

    if (!isClient) {
        return <div className="p-8">載入中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🔬 LIFF 直接初始化測試
                    </h1>
                    
                    <div className="mb-6">
                        <button
                            onClick={testLiffInit}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            開始測試 LIFF 初始化
                        </button>
                    </div>

                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">點擊按鈕開始測試...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">🎯 測試目的</h3>
                    <p className="text-yellow-700 text-sm">
                        這個頁面會測試多種不同的 LIFF 初始化方法，幫助找出為什麼會出現 "liffId is necessary" 錯誤。
                        請點擊按鈕並查看詳細的測試日誌。
                    </p>
                </div>
            </div>
        </div>
    );
}
