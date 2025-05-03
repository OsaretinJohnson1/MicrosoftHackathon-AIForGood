import type { NextAuthConfig } from 'next-auth';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig = {
    providers: [
        Google({allowDangerousEmailAccountLinking: true}), 
        Facebook({allowDangerousEmailAccountLinking: true}), 
        GitHub({allowDangerousEmailAccountLinking: true})
    ],
    pages: {
        signIn: "/login",
        // signOut: "/auth/signin",
        signOut: "/login",
    },
    // basePath: process.env.AUTH_URL,

    // cookies: {
    //     sessionToken: {
    //         name: `__Secure-authjs.session-token`,
    //         options: {
    //             httpOnly: true,
    //             sameSite: "lax",
    //             secure: process.env.NODE_ENV === "production",
    //             domain: ".appimate.com", // NOTE: Leading dot allows sharing across subdomains
    //         },
    //     },
    // },
    callbacks: {
        authorized({request, auth}) {
            const { nextUrl } = request;
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isAuthPage = nextUrl.pathname.startsWith('/auth');
            
            // Comment out the redirection from auth pages to dashboard for logged-in users
            /*
            // If user is logged in and trying to access auth pages, redirect to dashboard
            if (isLoggedIn && isAuthPage) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            */
            
            // If user is trying to access dashboard, require authentication
            if (isOnDashboard) {
                return isLoggedIn;
            }
            
            // Allow access to all other pages
            return true;
        },
    },
} satisfies NextAuthConfig;