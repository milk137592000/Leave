// LIFF 工具函數
declare global {
    interface Window {
        liff: any;
    }
}

// 硬編碼的 LIFF ID，確保總是可用
const FALLBACK_LIFF_ID = '2007680034-QnRpBayW';

/**
 * 獲取 LIFF ID
 */
export function getLiffId(): string {
    // 優先使用環境變數，如果沒有則使用硬編碼值
    const envLiffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffId = envLiffId || FALLBACK_LIFF_ID;
    
    console.log('獲取 LIFF ID:', {
        envLiffId,
        fallbackId: FALLBACK_LIFF_ID,
        finalId: liffId
    });
    
    return liffId;
}

/**
 * 載入 LIFF SDK
 */
export async function loadLiffSdk(): Promise<void> {
    if (window.liff) {
        console.log('LIFF SDK 已經載入');
        return;
    }

    console.log('載入 LIFF SDK...');
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = () => {
            console.log('LIFF SDK 載入成功');
            resolve();
        };
        script.onerror = (error) => {
            console.error('LIFF SDK 載入失敗:', error);
            reject(new Error('LIFF SDK 載入失敗'));
        };
        document.head.appendChild(script);
    });
}

/**
 * 初始化 LIFF
 */
export async function initializeLiff(): Promise<void> {
    const liffId = getLiffId();
    
    if (!liffId) {
        throw new Error('LIFF ID 未設定');
    }

    // 載入 LIFF SDK
    await loadLiffSdk();

    // 檢查是否已經初始化
    if (window.liff && typeof window.liff.isInClient === 'function') {
        console.log('LIFF 已經初始化，跳過重複初始化');
        return;
    }

    console.log(`初始化 LIFF，ID: ${liffId}`);
    
    try {
        await window.liff.init({ liffId });
        console.log('LIFF 初始化成功');
    } catch (error) {
        console.error('LIFF 初始化失敗:', error);
        throw error;
    }
}

/**
 * 檢查 LIFF 是否已準備好
 */
export function isLiffReady(): boolean {
    return !!(window.liff && typeof window.liff.isLoggedIn === 'function');
}

/**
 * 檢查是否已登入
 */
export function isLoggedIn(): boolean {
    if (!isLiffReady()) {
        return false;
    }
    return window.liff.isLoggedIn();
}

/**
 * 獲取用戶資料
 */
export async function getProfile() {
    if (!isLiffReady() || !isLoggedIn()) {
        throw new Error('LIFF 未準備好或用戶未登入');
    }
    return await window.liff.getProfile();
}

/**
 * 登入
 */
export function login(): void {
    if (!isLiffReady()) {
        throw new Error('LIFF 未準備好');
    }
    window.liff.login();
}

/**
 * 登出
 */
export function logout(): void {
    if (!isLiffReady()) {
        throw new Error('LIFF 未準備好');
    }
    window.liff.logout();
}
