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
 * 檢查是否在客戶端環境
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}

/**
 * 安全地獲取 window 物件
 */
export function safeWindow(): Window | null {
    return isClient() ? window : null;
}

/**
 * 安全地獲取 localStorage
 */
export function safeLocalStorage(): Storage | null {
    return isClient() ? localStorage : null;
}

/**
 * 安全地獲取 navigator
 */
export function safeNavigator(): Navigator | null {
    return isClient() ? navigator : null;
}

/**
 * 載入 LIFF SDK
 */
export async function loadLiffSdk(): Promise<void> {
    if (!isClient()) {
        throw new Error('LIFF SDK 只能在客戶端載入');
    }

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
    if (!isClient()) {
        throw new Error('LIFF 只能在客戶端初始化');
    }

    const liffId = getLiffId();
    const win = safeWindow();

    console.log('詳細 LIFF 初始化診斷:', {
        liffId,
        liffIdType: typeof liffId,
        liffIdLength: liffId?.length,
        liffIdTrimmed: liffId?.trim(),
        isValidFormat: /^\d{10}-[a-zA-Z0-9]{8}$/.test(liffId || ''),
        windowLiffExists: !!(win && win.liff),
        windowLiffType: win ? typeof win.liff : 'undefined'
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
            if (win && win.liff) {
                await win.liff.init({ liffId: testLiffId });
                console.log(`✅ LIFF 初始化成功，使用 ID: ${testLiffId}`);
                return;
            } else {
                throw new Error('LIFF SDK 未載入');
            }
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
    const win = safeWindow();
    return !!(win && win.liff && typeof win.liff.isLoggedIn === 'function');
}

/**
 * 檢查是否已登入
 */
export function isLoggedIn(): boolean {
    if (!isLiffReady()) {
        return false;
    }
    const win = safeWindow();
    return !!(win && win.liff && win.liff.isLoggedIn());
}

/**
 * 獲取用戶資料
 */
export async function getProfile() {
    if (!isLiffReady() || !isLoggedIn()) {
        throw new Error('LIFF 未準備好或用戶未登入');
    }
    const win = safeWindow();
    if (!win || !win.liff) {
        throw new Error('LIFF 未準備好');
    }
    return await win.liff.getProfile();
}

/**
 * 登入
 */
export function login(redirectUri?: string): void {
    if (!isLiffReady()) {
        throw new Error('LIFF 未準備好');
    }

    const win = safeWindow();
    if (!win || !win.liff) {
        throw new Error('LIFF 未準備好');
    }

    // 如果沒有指定重定向 URI，使用當前頁面 URL
    const currentUrl = redirectUri || (isClient() ? win.location.href : '');

    console.log('LIFF 登入，重定向到:', currentUrl);

    if (currentUrl) {
        win.liff.login({ redirectUri: currentUrl });
    } else {
        win.liff.login();
    }
}

/**
 * 登出
 */
export function logout(): void {
    if (!isLiffReady()) {
        throw new Error('LIFF 未準備好');
    }
    const win = safeWindow();
    if (!win || !win.liff) {
        throw new Error('LIFF 未準備好');
    }
    win.liff.logout();
}
