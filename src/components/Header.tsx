"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-stone-900 bg-opacity-70 backdrop-blur-sm fixed w-full top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white">Ubuntu Loan</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm ${
              pathname === "/" ? "text-[#fccf03] font-medium" : "text-stone-300 hover:text-white"
            } transition-colors duration-200`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm ${
              pathname === "/about" ? "text-[#fccf03] font-medium" : "text-stone-300 hover:text-white"
            } transition-colors duration-200`}
          >
            About
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link
                href="/user-app"
                className={`text-sm ${
                  pathname === "/user-app" ? "text-[#fccf03] font-medium" : "text-stone-300 hover:text-white"
                } transition-colors duration-200`}
              >
                Dashboard
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md transition-colors duration-200 font-medium"
              >
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`text-sm ${
                  pathname === "/auth/login" ? "text-[#fccf03] font-medium" : "text-stone-300 hover:text-white"
                } transition-colors duration-200`}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md transition-colors duration-200 font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button - would normally have a mobile menu implementation */}
        <button className="md:hidden text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
} 