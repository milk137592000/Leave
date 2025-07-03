import { useState, useEffect } from 'react';

/**
 * Hook for safely accessing browser APIs with SSR support
 */
export function useBrowserSafe() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return {
        isClient,
        window: isClient ? window : null,
        localStorage: isClient ? localStorage : null,
        navigator: isClient ? navigator : null,
        document: isClient ? document : null,
    };
}

/**
 * Hook for safely copying text to clipboard with fallback
 */
export function useClipboard() {
    const { isClient, navigator } = useBrowserSafe();

    const copyToClipboard = async (text: string): Promise<boolean> => {
        if (!isClient) {
            return false;
        }

        try {
            if (navigator && navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 備用方案：使用 prompt 讓用戶手動複製
                const result = prompt('請複製以下內容:', text);
                return result !== null;
            }
        } catch (error) {
            console.error('複製失敗:', error);
            // 備用方案：使用 prompt
            const result = prompt('複製失敗，請手動複製以下內容:', text);
            return result !== null;
        }
    };

    return { copyToClipboard };
}

/**
 * Hook for safely accessing localStorage with SSR support
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const { isClient, localStorage } = useBrowserSafe();
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        if (!isClient || !localStorage) {
            return;
        }

        try {
            const item = localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
    }, [key, isClient, localStorage]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (isClient && localStorage) {
                localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    const removeValue = () => {
        try {
            setStoredValue(initialValue);
            if (isClient && localStorage) {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue, removeValue] as const;
}

/**
 * Hook for safely navigating with SSR support
 */
export function useSafeNavigation() {
    const { isClient, window } = useBrowserSafe();

    const navigateTo = (url: string) => {
        if (isClient && window) {
            window.location.href = url;
        }
    };

    const getCurrentUrl = (): string => {
        if (isClient && window) {
            return window.location.href;
        }
        return '';
    };

    const getOrigin = (): string => {
        if (isClient && window) {
            return window.location.origin;
        }
        return '';
    };

    return {
        navigateTo,
        getCurrentUrl,
        getOrigin,
    };
}
