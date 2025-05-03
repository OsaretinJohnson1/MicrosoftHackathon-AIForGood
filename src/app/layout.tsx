import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes'
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ubuntu Loan | Community-Focused Lending Solutions",
    description: "Get instant access to personal and business loans with competitive rates and flexible repayment options.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // This is a placeholder for actual auth checking logic
    const isLoggedIn = false; // This would be replaced with actual auth check


    return (
        <SessionProvider>
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-50`}
            >
                <ThemeProvider attribute="class">
                    {/* <Header isLoggedIn={isLoggedIn} /> */}

                    <main>
                        {children}
                    </main>
                </ThemeProvider>
                  
                {/* <footer className="bg-stone-800 text-stone-300 py-8">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <p>© {new Date().getFullYear()} Ubuntu Loan. All rights reserved. NMLS ID #12345</p>
          </div>
        </footer> */}

                <Toaster position="top-right" />
            </body>
        </html>
        </SessionProvider>
    );
}
