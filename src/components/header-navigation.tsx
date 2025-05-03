"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { MotionDiv } from "@/components/motion/motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"

export function HeaderNavigation() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <MotionDiv
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Link href="/submit" className="text-sm font-medium hover:text-purple-700 transition-colors">
          Create Comic
        </Link>
      </MotionDiv>
      <MotionDiv
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Link href="/comics" className="text-sm font-medium hover:text-purple-700 transition-colors">
          Browse Comics
        </Link>
      </MotionDiv>
      <MotionDiv
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Link href="/about" className="text-sm font-medium hover:text-purple-700 transition-colors">
          About
        </Link>
      </MotionDiv>

      {isAuthenticated ? (
        <div className="flex items-center space-x-2">
          <MotionDiv
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
                    <User className="h-4 w-4 text-purple-700" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </MotionDiv>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <MotionDiv
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Link href="/login">
              <Button variant="ghost" className="text-sm">
                Log in
              </Button>
            </Link>
          </MotionDiv>
          <MotionDiv
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link href="/signup">
              <Button className="text-sm bg-purple-700 hover:bg-purple-800">Sign up</Button>
            </Link>
          </MotionDiv>
        </div>
      )}
    </nav>
  )
} 