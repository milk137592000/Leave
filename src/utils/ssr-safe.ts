/**
 * SSR-safe utilities for browser API access
 * 
 * These utilities provide safe access to browser APIs that are not available
 * during server-side rendering, preventing hydration mismatches and errors.
 */

/**
 * Check if code is running in the browser (client-side)
 */
export const isClient = (): boolean => {
    return typeof window !== 'undefined';
};

/**
 * Check if code is running on the server (server-side)
 */
export const isServer = (): boolean => {
    return typeof window === 'undefined';
};

/**
 * Safely access window object
 */
export const safeWindow = (): Window | null => {
    return isClient() ? window : null;
};

/**
 * Safely access document object
 */
export const safeDocument = (): Document | null => {
    return isClient() ? document : null;
};

/**
 * Safely access localStorage
 */
export const safeLocalStorage = (): Storage | null => {
    return isClient() ? localStorage : null;
};

/**
 * Safely access sessionStorage
 */
export const safeSessionStorage = (): Storage | null => {
    return isClient() ? sessionStorage : null;
};

/**
 * Safely access navigator
 */
export const safeNavigator = (): Navigator | null => {
    return isClient() ? navigator : null;
};

/**
 * Safely access location
 */
export const safeLocation = (): Location | null => {
    const win = safeWindow();
    return win ? win.location : null;
};

/**
 * Safely get current URL
 */
export const getCurrentUrl = (): string => {
    const location = safeLocation();
    return location ? location.href : '';
};

/**
 * Safely get origin
 */
export const getOrigin = (): string => {
    const location = safeLocation();
    return location ? location.origin : '';
};

/**
 * Safely copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!isClient()) {
        return false;
    }

    const nav = safeNavigator();
    
    try {
        if (nav && nav.clipboard) {
            await nav.clipboard.writeText(text);
            return true;
        } else {
            // Fallback: use prompt for manual copy
            const result = prompt('請複製以下內容:', text);
            return result !== null;
        }
    } catch (error) {
        console.error('複製失敗:', error);
        // Fallback: use prompt
        const result = prompt('複製失敗，請手動複製以下內容:', text);
        return result !== null;
    }
};

/**
 * Safely navigate to URL
 */
export const navigateTo = (url: string): void => {
    const win = safeWindow();
    if (win) {
        win.location.href = url;
    }
};

/**
 * Safely reload page
 */
export const reloadPage = (): void => {
    const win = safeWindow();
    if (win) {
        win.location.reload();
    }
};

/**
 * Safely get/set localStorage item
 */
export const getLocalStorageItem = (key: string): string | null => {
    const storage = safeLocalStorage();
    return storage ? storage.getItem(key) : null;
};

export const setLocalStorageItem = (key: string, value: string): boolean => {
    const storage = safeLocalStorage();
    if (storage) {
        try {
            storage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('localStorage setItem failed:', error);
            return false;
        }
    }
    return false;
};

export const removeLocalStorageItem = (key: string): boolean => {
    const storage = safeLocalStorage();
    if (storage) {
        try {
            storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('localStorage removeItem failed:', error);
            return false;
        }
    }
    return false;
};

/**
 * Safely check if user agent contains specific string
 */
export const isUserAgent = (userAgentString: string): boolean => {
    const nav = safeNavigator();
    return nav ? nav.userAgent.includes(userAgentString) : false;
};

/**
 * Safely check if running in LINE app
 */
export const isInLineApp = (): boolean => {
    return isUserAgent('Line');
};

/**
 * Safely execute code only on client-side
 */
export const clientOnly = <T>(fn: () => T, fallback?: T): T | undefined => {
    if (isClient()) {
        return fn();
    }
    return fallback;
};

/**
 * Safely execute async code only on client-side
 */
export const clientOnlyAsync = async <T>(
    fn: () => Promise<T>, 
    fallback?: T
): Promise<T | undefined> => {
    if (isClient()) {
        return await fn();
    }
    return fallback;
};

/**
 * Create a safe event listener that only works on client-side
 */
export const addSafeEventListener = (
    element: EventTarget | null,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
): (() => void) | null => {
    if (!isClient() || !element) {
        return null;
    }

    element.addEventListener(event, handler, options);
    
    return () => {
        element.removeEventListener(event, handler, options);
    };
};

/**
 * Safe wrapper for window.matchMedia
 */
export const safeMatchMedia = (query: string): MediaQueryList | null => {
    const win = safeWindow();
    return win && win.matchMedia ? win.matchMedia(query) : null;
};
