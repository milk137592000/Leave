'use client';

import React, { useState, useEffect } from 'react';

interface DebugInfo {
    env?: {
        NEXT_PUBLIC_LIFF_ID?: string;
        NODE_ENV?: string;
    };
    browser?: {
        userAgent: string;
        url: string;
        isClient: boolean;
    };
    timestamp?: string;
    buildTime?: string;
    apiTest?: any;
}

export default function DebugDeployment() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const info = {
                // Environment variables
                env: {
                    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
                    NODE_ENV: process.env.NODE_ENV,
                },
                // Browser info
                browser: {
                    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
                    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
                    isClient: typeof window !== 'undefined',
                },
                // Date and time
                timestamp: new Date().toISOString(),
                // Build info
                buildTime: new Date().toISOString(),
            };
            setDebugInfo(info);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }, []);

    const testApiCall = async () => {
        try {
            const response = await fetch('/api/check-env');
            const data = await response.json();
            setDebugInfo((prev: DebugInfo) => ({ ...prev, apiTest: data }));
        } catch (err) {
            setError(`API test failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Deployment Debug Information</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">API Test</h2>
                    <button
                        onClick={testApiCall}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Test API Connection
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                    <div className="space-y-2">
                        <a href="/" className="block text-blue-600 hover:underline">← Back to Home</a>
                        <a href="/ssr-test" className="block text-blue-600 hover:underline">SSR Test Page</a>
                        <a href="/line-setup" className="block text-blue-600 hover:underline">LINE Setup</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
