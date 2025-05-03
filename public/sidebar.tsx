"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Loan Applications",
    href: "/dashboard/applications",
    icon: DollarSign,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <>
      {/* Sidebar toggle button for mobile/collapsed state */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed left-0 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-r-lg bg-primary text-white shadow-md"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 -translate-x-full opacity-0" : "w-64 translate-x-0 opacity-100",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">LoanEase</span>
          </Link>
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded-full p-1 hover:bg-accent"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                    isActive ? "active bg-accent text-accent-foreground font-semibold" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-accent/50 p-4">
            <h4 className="mb-2 text-sm font-medium">Need help?</h4>
            <p className="text-xs text-muted-foreground mb-3">Contact our support team for assistance.</p>
            <Button size="sm" variant="secondary" className="w-full">
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && isMobile && (
        <div className="fixed inset-0 z-20 bg-black/50" onClick={() => setIsCollapsed(true)} aria-hidden="true" />
      )}
    </>
  )
}
