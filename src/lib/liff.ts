// LIFF 工具函數
declare global {
    interface Window {
        liff: any;
    }
}

// 硬編碼的 LIFF ID，確保總是可用
const FALLBACK_LIFF_ID = '2007680034-QnRpBayW';

/**
 * 獲取 LIFF ID - 強制使用硬編碼值
 */
export function getLiffId(): string {
    // 強制使用硬編碼值，完全不依賴環境變數
    const liffId = FALLBACK_LIFF_ID;

    console.log('=== 獲取 LIFF ID ===');
    console.log('硬編碼 LIFF ID:', liffId);
    console.log('LIFF ID 長度:', liffId.length);
    console.log('LIFF ID 類型:', typeof liffId);
    console.log('LIFF ID 格式檢查:', /^\d{10}-[a-zA-Z0-9]{8}$/.test(liffId));

    if (!liffId || typeof liffId !== 'string' || liffId.trim() === '') {
        throw new Error(`LIFF ID 無效: "${liffId}"`);
    }

    return liffId;
}

/**
 * 安全的 LIFF 初始化 - 使用多種方法確保成功
 */
export async function safeLiffInit(win: any, liffId: string): Promise<void> {
    if (!win || !win.liff) {
        throw new Error('LIFF SDK 未載入');
    }

    if (!liffId || typeof liffId !== 'string' || liffId.trim() === '') {
        throw new Error(`LIFF ID 無效: "${liffId}"`);
    }

    const trimmedLiffId = liffId.trim();

    // 方法1: 直接使用物件
    try {
        console.log('嘗試方法1: 直接物件初始化');
        await win.liff.init({ liffId: trimmedLiffId });
        console.log('✅ 方法1 成功');
        return;
    } catch (error1) {
        console.warn('方法1 失敗:', error1);
    }

    // 方法2: 使用字串參數
    try {
        console.log('嘗試方法2: 字串參數初始化');
        await win.liff.init(trimmedLiffId);
        console.log('✅ 方法2 成功');
        return;
    } catch (error2) {
        console.warn('方法2 失敗:', error2);
    }

    // 方法3: 重新創建物件
    try {
        console.log('嘗試方法3: 重新創建物件');
        const initConfig = {};
        (initConfig as any).liffId = trimmedLiffId;
        await win.liff.init(initConfig);
        console.log('✅ 方法3 成功');
        return;
    } catch (error3) {
        console.warn('方法3 失敗:', error3);
    }

    // 所有方法都失敗
    throw new Error(`所有 LIFF 初始化方法都失敗，LIFF ID: ${trimmedLiffId}`);
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

    console.log(`=== 準備初始化 LIFF ===`);
    console.log(`LIFF ID: "${liffId}"`);
    console.log('LIFF 初始化參數:', { liffId: liffId });

    // 額外驗證 LIFF ID
    if (!liffId || typeof liffId !== 'string' || liffId.trim() === '') {
        throw new Error(`LIFF ID 無效或為空: "${liffId}"`);
    }

    // 創建一個新的變數來避免任何潛在的變數衝突
    const finalLiffId = liffId.trim();
    console.log(`最終使用的 LIFF ID: "${finalLiffId}"`);
    console.log(`最終 LIFF ID 類型: ${typeof finalLiffId}`);
    console.log(`最終 LIFF ID 長度: ${finalLiffId.length}`);

    // 使用安全的 LIFF 初始化方法
    try {
        console.log(`準備初始化 LIFF，使用 ID: "${finalLiffId}"`);
        if (win && win.liff) {
            // 檢查是否已經初始化
            if (win.liff.isInClient === undefined) {
                console.log('LIFF 尚未初始化，開始初始化...');
                await safeLiffInit(win, finalLiffId);
                console.log(`✅ LIFF 初始化成功，使用 ID: ${finalLiffId}`);
            } else {
                console.log('LIFF 已經初始化過');
            }
            return;
        } else {
            throw new Error('LIFF SDK 未載入');
        }
    } catch (error) {
        console.error(`❌ LIFF 初始化失敗:`, error);
        console.error(`錯誤詳情:`, {
            errorMessage: error instanceof Error ? error.message : String(error),
            liffIdUsed: finalLiffId,
            liffIdType: typeof finalLiffId,
            liffIdLength: finalLiffId?.length
        });
        throw error;
    }
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
