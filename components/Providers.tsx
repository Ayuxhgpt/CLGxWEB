'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering ThemeProvider after mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <SessionProvider>
            {mounted ? (
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            ) : (
                <>{children}</>
            )}
        </SessionProvider>
    );
}
