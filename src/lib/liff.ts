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
    // 直接使用硬編碼值，確保總是有效
    const liffId = FALLBACK_LIFF_ID;

    console.log('獲取 LIFF ID:', {
        envLiffId: process.env.NEXT_PUBLIC_LIFF_ID,
        fallbackId: FALLBACK_LIFF_ID,
        finalId: liffId,
        isValid: !!liffId && liffId.trim() !== ''
    });

    if (!liffId || liffId.trim() === '') {
        throw new Error('LIFF ID 無效');
    }

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

    console.log('詳細 LIFF 初始化診斷:', {
        liffId,
        liffIdType: typeof liffId,
        liffIdLength: liffId?.length,
        liffIdTrimmed: liffId?.trim(),
        isValidFormat: /^\d{10}-[a-zA-Z0-9]{8}$/.test(liffId || ''),
        windowLiffExists: !!window.liff,
        windowLiffType: typeof window.liff
    });

    if (!liffId) {
        throw new Error('LIFF ID 未設定');
    }

    // 載入 LIFF SDK
    await loadLiffSdk();

    // 不檢查是否已初始化，強制重新初始化
    console.log('強制重新初始化 LIFF');

    console.log(`準備初始化 LIFF，ID: "${liffId}"`);
    console.log('LIFF 初始化參數:', { liffId: liffId });

    // 嘗試多種 LIFF ID 格式
    const liffIds = [
        liffId,
        liffId.trim(),
        '2007680034-QnRpBayW', // 硬編碼備用
        '1234567890-abcdefgh'  // 測試格式
    ];

    let lastError = null;

    for (const testLiffId of liffIds) {
        try {
            console.log(`嘗試使用 LIFF ID: "${testLiffId}"`);
            await window.liff.init({ liffId: testLiffId });
            console.log(`✅ LIFF 初始化成功，使用 ID: ${testLiffId}`);
            return;
        } catch (error) {
            console.error(`❌ LIFF ID "${testLiffId}" 初始化失敗:`, error);
            lastError = error;
        }
    }

    // 如果所有 LIFF ID 都失敗
    console.error('所有 LIFF ID 都初始化失敗');
    throw lastError || new Error('LIFF 初始化失敗');
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
export function login(redirectUri?: string): void {
    if (!isLiffReady()) {
        throw new Error('LIFF 未準備好');
    }

    // 如果沒有指定重定向 URI，使用當前頁面 URL
    const currentUrl = redirectUri || (typeof window !== 'undefined' ? window.location.href : '');

    console.log('LIFF 登入，重定向到:', currentUrl);

    if (currentUrl) {
        window.liff.login({ redirectUri: currentUrl });
    } else {
        window.liff.login();
    }
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
