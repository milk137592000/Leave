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
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            
            if (!liffId) {
                setError('LIFF ID 未設定，請檢查環境變數');
                setIsLoading(false);
                return;
            }

            // 動態載入 LIFF SDK
            if (!window.liff) {
                const script = document.createElement('script');
                script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            // 初始化 LIFF
            await window.liff.init({ liffId });
            setIsLiffReady(true);

            // 檢查登入狀態
            const loggedIn = window.liff.isLoggedIn();
            setIsLoggedIn(loggedIn);

            if (loggedIn) {
                // 獲取 LINE 用戶資料
                const profile = await window.liff.getProfile();
                setLiffProfile(profile);

                // 檢查是否已設定用戶資料
                await checkUserProfile(profile.userId);
            }

        } catch (err) {
            console.error('LIFF 初始化失敗:', err);
            setError('LIFF 初始化失敗');
        } finally {
            setIsLoading(false);
        }
    };

    // 檢查用戶資料
    const checkUserProfile = async (lineUserId: string) => {
        try {
            const response = await fetch(`/api/user-profile?lineUserId=${lineUserId}`);
            const data = await response.json();

            if (data.exists && data.profile) {
                setUserProfile(data.profile);
            }
        } catch (err) {
            console.error('檢查用戶資料失敗:', err);
        }
    };

    // 登入
    const login = () => {
        if (window.liff && window.liff.login) {
            window.liff.login();
        }
    };

    // 登出
    const logout = () => {
        if (window.liff && window.liff.logout) {
            window.liff.logout();
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
