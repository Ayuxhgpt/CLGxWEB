import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Paths requiring Authentication (Student + Admin)
    const protectedPaths = ['/dashboard', '/profile', '/settings', '/albums/upload'];

    // Paths requiring Admin Role
    const adminPaths = ['/admin'];

    // 1. Redirect if not logged in
    if (!token) {
        if (protectedPaths.some(path => pathname.startsWith(path)) ||
            adminPaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // 2. Redirect if verified student tries to access auth pages
    if (token) {
        if (pathname === '/login' || pathname === '/register') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // 3. Admin Route Protection
        if (adminPaths.some(path => pathname.startsWith(path))) {
            if (token.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/albums/upload',
        '/login',
        '/register'
    ],
};
