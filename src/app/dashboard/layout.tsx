import type React from "react"

import Link from "next/link"
import { Home } from "lucide-react"
import { SessionProvider } from "next-auth/react"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
                    <Link href="/" className="flex items-center gap-2 font-semibold md:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                            <span className="text-primary-foreground font-bold">L</span>
                        </div>
                    </Link>
                    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                            <Home className="h-4 w-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full">
                            Help
                        </Button>
                        <Button size="sm" className="rounded-full">
                            Account
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex flex-1 flex-col ml-0 md:ml-64 transition-all duration-300 ease-in-out">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    )
}
