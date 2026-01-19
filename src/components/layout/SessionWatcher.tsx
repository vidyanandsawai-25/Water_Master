'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';

export function SessionWatcher() {
    const pathname = usePathname();

    const handleLogout = useCallback(async () => {
        try {
            await logoutAction();
        } catch (error) {
            console.error("Logout failed", error);
            // Fallback if action fails
            window.location.href = '/login';
        }
    }, []);

    // SessionWatcher disabled for static login: always keep user logged in
    // No session polling or forced logout
    useEffect(() => {}, []);

    return null;
}
