'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <SessionProvider>
            {mounted ? (
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    {children}
                </ThemeProvider>
            ) : (
                <>{children}</>
            )}
        </SessionProvider>
    );
}
