import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Menu } from "lucide-react"
import { MotionDiv } from "@/components/motion/motion"
import { AnimatedLogo } from "@/components/animated-logo"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Culture to Comic - Microsoft AI Fluency Hackathon",
  description: "Transform cultural stories into visual comics using AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            {/* 
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

                
                <nav className="hidden md:flex items-center space-x-6">
                  <MotionDiv
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    
                  </MotionDiv>
                  <MotionDiv
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Link href="/comics" className="text-sm font-medium text-purple-700 hover:text-black transition-colors">
                      Browse Comics
                    </Link>
                  </MotionDiv>
                  <MotionDiv
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Link href="/how-it-works" className="text-sm font-medium text-purple-700 hover:text-black transition-colors">
                      How It Works
                    </Link>
                  </MotionDiv>
                  <div className="flex items-center space-x-2">
                    <MotionDiv
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Link href="/login">
                        <Button variant="ghost" className="text-sm bg-blue-500 hover:bg-blue-200">
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
                </nav>

                
                <div className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-primary">
                    <Menu className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </header>
            */}

            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
