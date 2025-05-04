"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-8 bg-white/80">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-bold mb-3 text-gray-500">Culture to Comic</h3>
          
          <div className="flex space-x-6 mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-all duration-200 text-gray-500">
              Home
            </Link>
            <Link href="/signup" className="text-slate-400 hover:text-white transition-all duration-200 text-gray-500">
              Create
            </Link>
            <Link href="/comics" className="text-slate-400 hover:text-white transition-all duration-200 text-gray-500">
              Browse
            </Link>
            {/* <Link href="/about" className="text-slate-400 hover:text-white transition-all duration-200">
              About
            </Link> */}
          </div>
          
          <div className="text-center text-slate-500 text-xs mt-4">
            <p>© {new Date().getFullYear()} Culture to Comic</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 