import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authConfig } from './auth.config';

// No database imports needed in middleware

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

// Use the auth config for middleware
const { auth } = NextAuth(authConfig);

// Export the middleware function with the correct name
export const middleware = auth(async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isAuthPage = path.startsWith('/auth');
    const isLoginOrRegister = path === '/auth/login' || path === '/auth/signup';
    const isUserAppPage = path.startsWith('/user-app');
    const isDashboardPage = path.startsWith('/dashboard');
    const publicPages = ['/', '/help', '/terms', '/how-to-borrow', '/how-to-postpone', '/how-to-repay', '/faq', '/about', '/contact'];
    const isPublicPage = publicPages.includes(path) || path.startsWith('/blog');

    // Session check
    const session = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
    });

    // Check admin status
    const isNormalAdmin = session?.isAdmin === 1;
    const isSuperAdmin = session?.isAdmin === 2;
    const isAdmin = isNormalAdmin || isSuperAdmin;

    // Redirect logged-in users trying to access login or register pages
    if (session && isLoginOrRegister) {
        if (isAdmin) {
            console.log('Logged-in admin trying to access auth page - redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
            console.log('Logged-in user trying to access auth page - redirecting to user-app');
            return NextResponse.redirect(new URL('/user-app', req.url));
        }
    }

    // Early admin privilege check:
    // Non-admin users trying to access dashboard should be immediately redirected
    if (session && isDashboardPage && !isAdmin) {
        console.log('Non-admin user attempting to access dashboard - redirecting to user-app');
        return NextResponse.redirect(new URL('/user-app', req.url));
    }

    // If user is not logged in and trying to access protected pages, redirect to login
    if (!session && (isDashboardPage || isUserAppPage) && !isPublicPage) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('callbackUrl', isAdmin ? '/dashboard' : path);
        return NextResponse.redirect(redirectUrl);
    }

    // Google OAuth users will be created via API endpoint during login flow
    // No need to do that in middleware

    // Handle CORS for API routes
    const response = NextResponse.next();
    Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
})

// Routes that middleware should not run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$|sw\\.js).*)',
        
        // Explicitly include protected paths
        '/dashboard/:path*',
        '/user-app/:path*',
        '/auth/:path*'
    ],
}