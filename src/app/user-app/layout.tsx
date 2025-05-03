import type React from "react"

import Link from "next/link"
import { UserDashboardSidebar } from "@/components/user-dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Bell, DollarSign, HelpCircle } from "lucide-react"

import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import ProfileDropdown from "@/components/user-app/ProfileDropdown"

export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = {
        name: session?.user?.name,
        email: session?.user?.email,
        avatar: session?.user?.image,
        unreadNotifications: 0,
    }

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                            <DollarSign className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold gradient-text">LoanEase</span>
                    </Link>

                    <div className="ml-auto flex items-center gap-4">
                        <Link href="/user-dashboard/notifications" className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {user?.unreadNotifications > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                    {user?.unreadNotifications}
                                </span>
                            )}
                        </Link>

                        <Button variant="outline" size="sm" className="rounded-full hidden md:flex" asChild>
                            <Link href="/user-dashboard/support">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Help
                            </Link>
                        </Button>

                        <ProfileDropdown />
                    </div>
                </header>

                <div className="flex flex-1">
                    <UserDashboardSidebar />
                    <main className="flex flex-1 flex-col ml-0 md:ml-64 transition-all duration-300 ease-in-out">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    )
}
