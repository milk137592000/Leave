import { useState, useEffect } from 'react';

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

    // 初始化 LIFF
    const initializeLiff = async () => {
        try {
            // 臨時解決方案：如果環境變數未設定，使用硬編碼的 LIFF ID
            let liffId = process.env.NEXT_PUBLIC_LIFF_ID;

            console.log('開始初始化 LIFF');
            console.log('環境變數 LIFF ID:', liffId);
            console.log('所有環境變數:', {
                NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
                NODE_ENV: process.env.NODE_ENV
            });

            // 如果環境變數未設定，使用硬編碼值
            if (!liffId || liffId.trim() === '') {
                liffId = '2007680034-QnRpBayW';
                console.log('使用硬編碼 LIFF ID:', liffId);
            }

            if (!liffId || liffId.trim() === '') {
                const errorMsg = `LIFF ID 仍然無效。當前值: "${liffId}"`;
                console.error(errorMsg);
                setError(errorMsg);
                setIsLoading(false);
                return;
            }

            // 動態載入 LIFF SDK
            if (!window.liff) {
                console.log('載入 LIFF SDK...');
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';

                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        console.log('LIFF SDK 載入成功');
                        resolve(undefined);
                    };
                    script.onerror = (err) => {
                        console.error('LIFF SDK 載入失敗:', err);
                        reject(err);
                    };
                    document.head.appendChild(script);
                });
            }

            // 檢查 LIFF 是否已經初始化
            if (window.liff && typeof window.liff.init === 'function') {
                try {
                    // 檢查是否已經初始化過
                    if (window.liff.isInClient !== undefined) {
                        console.log('LIFF 已經初始化，跳過重複初始化');
                        setIsLiffReady(true);
                    } else {
                        console.log('LIFF SDK 已載入但未初始化，開始初始化...');
                        await window.liff.init({ liffId });
                        console.log('LIFF 初始化成功');
                        setIsLiffReady(true);
                    }

                    // 等待一小段時間確保初始化完成
                    await new Promise(resolve => setTimeout(resolve, 200));

                    // 檢查登入狀態
                    const loggedIn = window.liff.isLoggedIn();
                    console.log('登入狀態:', loggedIn);
                    setIsLoggedIn(loggedIn);

                    if (loggedIn) {
                        try {
                            const profile = await window.liff.getProfile();
                            console.log('獲取用戶資料成功:', profile);
                            setLiffProfile(profile);
                            await checkUserProfile(profile.userId);
                        } catch (profileErr) {
                            console.error('獲取用戶資料失敗:', profileErr);
                            // 即使獲取資料失敗，也保持登入狀態
                        }
                    }
                } catch (initError) {
                    console.error('LIFF 初始化過程中發生錯誤:', initError);
                    // 如果初始化失敗，但 LIFF 可能已經可用，嘗試直接使用
                    if (window.liff.isLoggedIn) {
                        console.log('嘗試直接使用已存在的 LIFF 實例');
                        setIsLiffReady(true);
                        const loggedIn = window.liff.isLoggedIn();
                        setIsLoggedIn(loggedIn);

                        if (loggedIn) {
                            try {
                                const profile = await window.liff.getProfile();
                                setLiffProfile(profile);
                                await checkUserProfile(profile.userId);
                            } catch (profileErr) {
                                console.error('獲取用戶資料失敗:', profileErr);
                            }
                        }
                    } else {
                        throw initError;
                    }
                }
            } else {
                throw new Error('LIFF SDK 未正確載入');
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
            console.log(`檢查用戶資料，LINE User ID: ${lineUserId}`);
            const response = await fetch(`/api/user-profile?lineUserId=${lineUserId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
            }
        }
    };

    // 登入
    const login = () => {
        try {
            console.log('嘗試登入 LINE...');
            if (window.liff && window.liff.login) {
                window.liff.login();
            } else {
                console.error('LIFF 未初始化或登入功能不可用');
                setError('LIFF 未初始化，請重新載入頁面');
            }
        } catch (err) {
            console.error('登入失敗:', err);
            setError('登入失敗，請稍後再試');
        }
    };

    // 登出
    const logout = () => {
        try {
            console.log('登出 LINE...');
            if (window.liff && window.liff.logout) {
                window.liff.logout();
                setIsLoggedIn(false);
                setLiffProfile(null);
                setUserProfile(null);
                console.log('登出成功');
            } else {
                console.error('LIFF 未初始化或登出功能不可用');
            }
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
