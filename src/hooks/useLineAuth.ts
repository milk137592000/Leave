import { useState, useEffect } from 'react';
import {
    initializeLiff as initLiff,
    isLiffReady as checkIsLiffReady,
    isLoggedIn as checkIsLoggedIn,
    getProfile,
    login as liffLogin,
    logout as liffLogout,
    isClient,
    safeWindow,
    safeLocalStorage
} from '@/lib/liff';

interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
}

interface UserProfile {
    lineUserId: string;
    displayName: string;
    team: string;
    role: string;
    memberName: string;
    notificationEnabled: boolean;
}

interface UseLineAuthReturn {
    isLiffReady: boolean;
    isLoggedIn: boolean;
    liffProfile: LiffProfile | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

declare global {
    interface Window {
        liff: any;
    }
}

export function useLineAuth(): UseLineAuthReturn {
    const [isLiffReady, setIsLiffReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [liffProfile, setLiffProfile] = useState<LiffProfile | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 測試模式 - 檢查是否有測試用戶資料
    const isTestMode = typeof window !== 'undefined' && window.location.search.includes('test=true');

    // 初始化 LIFF - 使用和診斷頁面相同的邏輯
    const initializeLiff = async () => {
        try {
            console.log('=== useLineAuth LIFF 初始化開始 ===');

            // 直接使用診斷頁面的成功邏輯
            const liffId = '2007680034-QnRpBayW';
            console.log(`使用硬編碼 LIFF ID: ${liffId}`);

            // 載入 LIFF SDK
            if (!(window as any).liff) {
                console.log('載入 LIFF SDK...');
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('LIFF SDK 載入超時'));
                    }, 10000); // 10秒超時

                    script.onload = () => {
                        clearTimeout(timeout);
                        console.log('✅ LIFF SDK 載入成功');
                        // 等待一小段時間確保 LIFF 物件完全初始化
                        setTimeout(() => {
                            if ((window as any).liff) {
                                resolve(true);
                            } else {
                                reject(new Error('LIFF 物件未正確初始化'));
                            }
                        }, 100);
                    };
                    script.onerror = (err) => {
                        clearTimeout(timeout);
                        console.log('❌ LIFF SDK 載入失敗');
                        reject(new Error('LIFF SDK 載入失敗'));
                    };
                    document.head.appendChild(script);
                });
            } else {
                console.log('LIFF SDK 已存在');
            }

            // 驗證 LIFF 物件是否正確載入
            if (!(window as any).liff) {
                throw new Error('LIFF 物件不存在');
            }

            if (typeof (window as any).liff.init !== 'function') {
                throw new Error('LIFF.init 函數不存在');
            }

            // 嘗試初始化 - 使用和直接測試相同的邏輯
            console.log('開始初始化 LIFF...');
            console.log('使用 LIFF ID:', liffId);

            try {
                // 直接初始化，不檢查是否已初始化（因為重複初始化通常是安全的）
                const config = { liffId: liffId };
                console.log('初始化配置:', JSON.stringify(config));
                await (window as any).liff.init(config);
                console.log('✅ LIFF 初始化成功');
            } catch (initError) {
                // 如果初始化失敗，可能是已經初始化過了
                console.log('初始化失敗，可能已經初始化過:', initError);
                // 檢查是否真的已經初始化
                if (typeof (window as any).liff.isInClient === 'function') {
                    console.log('LIFF 已經初始化，繼續使用');
                } else {
                    throw initError; // 如果真的失敗了，拋出錯誤
                }
            }

            setIsLiffReady(true);

            // 檢查登入狀態 - 確保 LIFF 已正確初始化
            let currentLoggedIn = false;
            try {
                // 驗證 LIFF 是否真的已經初始化
                if (typeof (window as any).liff.isLoggedIn !== 'function') {
                    throw new Error('LIFF isLoggedIn 函數不可用');
                }

                currentLoggedIn = (window as any).liff.isLoggedIn();
                console.log('登入狀態:', currentLoggedIn);
                setIsLoggedIn(currentLoggedIn);
            } catch (loginCheckError) {
                console.error('檢查登入狀態失敗:', loginCheckError);
                // 如果檢查登入狀態失敗，設為未登入
                setIsLoggedIn(false);
            }

            if (currentLoggedIn) {
                try {
                    const profile = await (window as any).liff.getProfile();
                    console.log('獲取用戶資料成功:', profile);
                    setLiffProfile(profile);
                    await checkUserProfile(profile.userId);
                } catch (profileErr) {
                    console.error('獲取用戶資料失敗:', profileErr);
                    // 即使獲取資料失敗，也保持登入狀態
                }
            }

        } catch (err) {
            console.error('LIFF 初始化失敗:', err);
            setError(`LIFF 初始化失敗: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 檢查用戶資料
    const checkUserProfile = async (lineUserId: string, retryCount = 0) => {
        try {
            // 驗證 lineUserId 參數
            if (!lineUserId || typeof lineUserId !== 'string' || lineUserId.trim() === '') {
                console.error('無效的 LINE User ID:', lineUserId);
                setUserProfile(null);
                return;
            }

            console.log(`檢查用戶資料，LINE User ID: ${lineUserId}`);
            const response = await fetch(`/api/user-profile?lineUserId=${encodeURIComponent(lineUserId)}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('用戶資料檢查結果:', data);

            if (data.exists && data.profile) {
                setUserProfile(data.profile);
                console.log('用戶資料設定成功:', data.profile);
            } else {
                console.log('用戶尚未設定身份');
                setUserProfile(null);
            }
        } catch (err) {
            console.error('檢查用戶資料失敗:', err);

            // 重試機制，最多重試 2 次
            if (retryCount < 2) {
                console.log(`重試檢查用戶資料，第 ${retryCount + 1} 次重試`);
                setTimeout(() => {
                    checkUserProfile(lineUserId, retryCount + 1);
                }, 1000 * (retryCount + 1)); // 遞增延遲
            } else {
                // 重試失敗後，設置為 null
                setUserProfile(null);
            }
        }
    };

    // 登入
    const login = () => {
        try {
            console.log('嘗試登入 LINE...');
            const win = safeWindow();
            const localStorage = safeLocalStorage();
            const currentUrl = win ? win.location.href : '';
            console.log('當前頁面 URL:', currentUrl);

            // 保存當前頁面到 localStorage，登入後重定向使用
            if (localStorage && currentUrl) {
                localStorage.setItem('lineRedirectTarget', currentUrl);
                console.log('保存重定向目標:', currentUrl);
            }

            // 使用 LIFF 默認行為，不指定 redirectUri
            console.log('使用 LIFF 默認重定向行為');
            (window as any).liff.login();
        } catch (err) {
            console.error('登入失敗:', err);
            setError('登入失敗，請稍後再試');
        }
    };

    // 登出
    const logout = () => {
        try {
            console.log('登出 LINE...');
            (window as any).liff.logout();
            setIsLoggedIn(false);
            setLiffProfile(null);
            setUserProfile(null);
            console.log('登出成功');
        } catch (err) {
            console.error('登出失敗:', err);
            // 即使登出失敗，也清除本地狀態
            setIsLoggedIn(false);
            setLiffProfile(null);
            setUserProfile(null);
        }
    };

    // 重新獲取用戶資料
    const refreshProfile = async () => {
        if (liffProfile) {
            await checkUserProfile(liffProfile.userId);
        }
    };

    // 組件掛載時初始化
    useEffect(() => {
        if (isTestMode) {
            // 測試模式 - 模擬已登入狀態
            setIsLiffReady(true);
            setIsLoggedIn(true);
            setLiffProfile({
                userId: 'test-user-123',
                displayName: '測試用戶',
                pictureUrl: ''
            });
            checkUserProfile('test-user-123');
            setIsLoading(false);
        } else {
            initializeLiff();
        }
    }, [isTestMode]);

    return {
        isLiffReady,
        isLoggedIn,
        liffProfile,
        userProfile,
        isLoading,
        error,
        login,
        logout,
        refreshProfile
    };
}
