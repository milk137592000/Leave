'use client';

import { useState, useEffect } from 'react';
import { useBrowserSafe, useClipboard, useLocalStorage, useSafeNavigation } from '@/hooks/useBrowserSafe';
import { 
    isClient, 
    isServer, 
    safeWindow, 
    safeLocalStorage, 
    safeNavigator,
    getCurrentUrl,
    getOrigin,
    copyToClipboard,
    isInLineApp
} from '@/utils/ssr-safe';

export default function SSRTestPage() {
    const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Test hooks
    const { isClient: hookIsClient, window, localStorage, navigator } = useBrowserSafe();
    const { copyToClipboard: hookCopyToClipboard } = useClipboard();
    const { getCurrentUrl: hookGetCurrentUrl, getOrigin: hookGetOrigin } = useSafeNavigation();
    const [testValue, setTestValue] = useLocalStorage('ssr-test', 'default');

    useEffect(() => {
        setIsHydrated(true);
        
        // Run all SSR safety tests
        const results = {
            // Utility function tests
            isClient: isClient(),
            isServer: isServer(),
            safeWindow: !!safeWindow(),
            safeLocalStorage: !!safeLocalStorage(),
            safeNavigator: !!safeNavigator(),
            getCurrentUrl: getCurrentUrl(),
            getOrigin: getOrigin(),
            isInLineApp: isInLineApp(),
            
            // Hook tests
            hookIsClient,
            hookWindow: !!window,
            hookLocalStorage: !!localStorage,
            hookNavigator: !!navigator,
            hookGetCurrentUrl: hookGetCurrentUrl(),
            hookGetOrigin: hookGetOrigin(),
            
            // LocalStorage hook test
            testValue,
            
            // Environment info
            userAgent: navigator?.userAgent || 'N/A',
            currentUrl: window?.location.href || 'N/A',
            origin: window?.location.origin || 'N/A',
            
            // Hydration status
            isHydrated: true,
        };
        
        setTestResults(results);
        console.log('SSR Test Results:', results);
    }, [hookIsClient, window, localStorage, navigator, hookGetCurrentUrl, hookGetOrigin, testValue]);

    const runCopyTest = async () => {
        const testText = 'SSR Test - Copy functionality works!';
        
        // Test utility function
        const utilResult = await copyToClipboard(testText);
        
        // Test hook
        const hookResult = await hookCopyToClipboard(testText);
        
        setTestResults(prev => ({
            ...prev,
            copyTestUtil: utilResult,
            copyTestHook: hookResult,
        }));
        
        if (utilResult || hookResult) {
            alert('複製測試成功！');
        }
    };

    const testLocalStorage = () => {
        const newValue = `test-${Date.now()}`;
        setTestValue(newValue);
        
        setTestResults(prev => ({
            ...prev,
            localStorageTest: newValue,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        SSR 安全性測試頁面
                    </h1>
                    
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">測試狀態</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 rounded ${isHydrated ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                                <strong>Hydration 狀態:</strong> {isHydrated ? '✅ 已完成' : '⏳ 進行中'}
                            </div>
                            <div className={`p-3 rounded ${hookIsClient ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>客戶端環境:</strong> {hookIsClient ? '✅ 正常' : '❌ 異常'}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">功能測試</h2>
                        <div className="space-y-2">
                            <button
                                onClick={runCopyTest}
                                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
                            >
                                測試複製功能
                            </button>
                            <button
                                onClick={testLocalStorage}
                                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                測試 LocalStorage
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">測試結果</h2>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                            <pre className="text-sm">
                                {JSON.stringify(testResults, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">SSR 安全檢查清單</h2>
                        <div className="space-y-2">
                            <div className={`p-3 rounded ${testResults.isClient ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>✓ isClient() 檢查:</strong> {testResults.isClient ? '通過' : '失敗'}
                            </div>
                            <div className={`p-3 rounded ${testResults.safeWindow ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>✓ safeWindow() 檢查:</strong> {testResults.safeWindow ? '通過' : '失敗'}
                            </div>
                            <div className={`p-3 rounded ${testResults.safeLocalStorage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>✓ safeLocalStorage() 檢查:</strong> {testResults.safeLocalStorage ? '通過' : '失敗'}
                            </div>
                            <div className={`p-3 rounded ${testResults.safeNavigator ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>✓ safeNavigator() 檢查:</strong> {testResults.safeNavigator ? '通過' : '失敗'}
                            </div>
                            <div className={`p-3 rounded ${testResults.hookIsClient ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <strong>✓ useBrowserSafe() Hook:</strong> {testResults.hookIsClient ? '通過' : '失敗'}
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>此頁面測試所有 SSR 安全功能，確保在伺服器端渲染和客戶端 hydration 過程中不會出現錯誤。</p>
                        <p>所有瀏覽器 API 的存取都應該通過安全包裝函數進行，以避免 SSR 錯誤。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
