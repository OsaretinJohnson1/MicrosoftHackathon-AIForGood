import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Menu, User } from "lucide-react"
import { MotionDiv } from "@/components/motion/motion"
import { AnimatedLogo } from "@/components/animated-logo"
import { SessionProvider } from "@/components/session-provider"
import { HeaderNavigation } from "@/components/header-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Culture to Comic - Microsoft AI Fluency Hackathon",
  description: "Transform cultural stories into visual comics using AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className="flex flex-col min-h-screen">
              <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center space-x-2">
                    <AnimatedLogo />
                    <MotionDiv
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <span className="font-bold text-xl text-purple-900">CultureComic</span>
                    </MotionDiv>
                  </Link>

                  {/* Navigation with auth handling */}
                  <HeaderNavigation />

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <Button variant="ghost" size="icon" className="text-primary">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </header>

              <main className="flex-1">{children}</main>

              <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Culture to Comic</h3>
                      <p className="text-gray-400">
                        Preserving cultural heritage through AI-powered visual storytelling.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link href="/submit" className="text-gray-400 hover:text-white transition-colors">
                            Create Comic
                          </Link>
                        </li>
                        <li>
                          <Link href="/comics" className="text-gray-400 hover:text-white transition-colors">
                            Browse Comics
                          </Link>
                        </li>
                        <li>
                          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                            About
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Connect</h3>
                      <p className="text-gray-400 mb-2">Join our community to share and preserve cultural stories.</p>
                      <div className="flex space-x-4 mt-4">
                        <Link href="/signup">
                          <Button className="bg-purple-700 hover:bg-purple-800">Sign Up</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>© {new Date().getFullYear()} Culture to Comic. Microsoft AI Fluency Hackathon Project.</p>
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
