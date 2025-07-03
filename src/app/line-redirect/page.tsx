'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLineAuth } from '@/hooks/useLineAuth';
import { useLocalStorage } from '@/hooks/useBrowserSafe';

function LineRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLiffReady, isLoggedIn, liffProfile, userProfile, isLoading } = useLineAuth();
    const [redirectTarget, setRedirectTarget, removeRedirectTarget] = useLocalStorage<string | null>('lineRedirectTarget', null);

    useEffect(() => {
        // 等待 LIFF 初始化完成
        if (!isLiffReady || isLoading) {
            return;
        }

        console.log('LINE 重定向頁面 - 狀態檢查:', {
            isLoggedIn,
            hasProfile: !!liffProfile,
            hasUserProfile: !!userProfile,
            searchParams: Object.fromEntries(searchParams.entries())
        });

        // 檢查是否有重定向目標
        const redirectTo = searchParams.get('redirect') || redirectTarget;
        
        if (!isLoggedIn) {
            // 未登入，跳轉到登入頁面
            console.log('用戶未登入，跳轉到首頁');
            router.push('/');
            return;
        }

        if (!userProfile) {
            // 已登入但未設定身份，跳轉到身份設定頁面
            console.log('用戶已登入但未設定身份，跳轉到身份設定頁面');
            router.push('/line-setup');
            return;
        }

        // 已登入且已設定身份
        if (redirectTo) {
            console.log('跳轉到目標頁面:', redirectTo);
            removeRedirectTarget();
            router.push(redirectTo);
        } else {
            // 沒有指定目標，跳轉到今天的請假頁面
            const today = new Date().toISOString().split('T')[0];
            console.log('跳轉到今天的請假頁面:', today);
            router.push(`/leave/${today}`);
        }
    }, [isLiffReady, isLoading, isLoggedIn, userProfile, router, searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">處理中...</h2>
                <p className="text-gray-600">正在檢查登入狀態並重定向</p>

                {/* 調試資訊 */}
                <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <p>LIFF 準備: {isLiffReady ? '✅' : '❌'}</p>
                    <p>載入中: {isLoading ? '✅' : '❌'}</p>
                    <p>已登入: {isLoggedIn ? '✅' : '❌'}</p>
                    <p>有用戶資料: {userProfile ? '✅' : '❌'}</p>
                </div>
            </div>
        </div>
    );
}

export default function LineRedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">載入中...</h2>
                    <p className="text-gray-600">正在初始化頁面</p>
                </div>
            </div>
        }>
            <LineRedirectContent />
        </Suspense>
    );
}
