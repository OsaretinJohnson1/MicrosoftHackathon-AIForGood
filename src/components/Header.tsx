'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const { data: session } = useSession();
  return (
    <header className="bg-gray-900 text-stone-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-2xl">
              <span className="text-white">Ubuntu</span>
              <span className="text-[#fccf03]">Lend</span>
            </Link>
          </div>
          <nav>
            <ul className="flex items-center space-x-6">
              <li><Link href="/how-to-borrow" className="hover:text-amber-200 transition-colors">How to borrow</Link></li>
              <li><Link href="/how-to-postpone" className="hover:text-amber-200 transition-colors">How to postpone</Link></li>
              <li><Link href="/how-to-repay" className="hover:text-amber-200 transition-colors">How to repay</Link></li>
              <li><Link href="/faq" className="hover:text-amber-200 transition-colors">FAQ</Link></li>
              {/* <li><Link href="/about" className="hover:text-amber-200 transition-colors">About us</Link></li> */}
              <li><Link href="/contact" className="hover:text-amber-200 transition-colors">Contact us</Link></li>
              <li><a href="tel:+27718685388" className="hover:text-amber-200 transition-colors">+27 71 868 5388</a></li>
              {session ? (
                  <li>  
                    <Link href={session.user?.isAdmin === 1 ? "user-app" : "dashboard"}
                          className="bg-yellow-500 text-stone-800 hover:bg-stone-200 px-4 py-2 rounded transition-colors">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/auth/login" className="bg-yellow-500 text-stone-800 hover:bg-stone-200 px-4 py-2 rounded transition-colors">
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/signup" className="bg-yellow-500 text-stone-800 hover:bg-stone-200 px-4 py-2 rounded transition-colors">
                        Register
                      </Link>
                    </li>
                  </>
                )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
} 
