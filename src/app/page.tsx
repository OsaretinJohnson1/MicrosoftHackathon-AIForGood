"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {
  MotionSection,
  MotionH2,
  MotionDiv,
  fadeIn,
  staggerContainer,
} from "@/components/motion/motion"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"
import { HowItWorks } from "@/components/HowItWorks"
import { HeroSection } from "@/components/HeroSection"
import Marquee from "@/components/Marquee"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <HowItWorks />
      <Marquee />

      {/* Featured Comics Section */}
      {/* <MotionSection
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-purple-50/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer(0.2, 0.1)}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <MotionH2 className="text-3xl font-bold tracking-tight text-primary" variants={fadeIn(0.2, 0.5)}>
              Featured Comics
            </MotionH2>
            <MotionDiv variants={fadeIn(0.3, 0.5)}>
              <Link href="/comics" className="text-purple-600 hover:text-purple-800 flex items-center group">
                View all comics{" "}
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
            </MotionDiv>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id, index) => (
              <AnimatedCard key={id} delay={0.3 + index * 0.1} className="overflow-hidden">
                <Link href={`/comic/${id}`} className="block h-full">
                  <div className="aspect-[3/4] relative bg-muted">
                    <img
                      src={`/placeholder.svg?height=400&width=300&text=Comic ${id}`}
                      alt={`Featured comic ${id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">Cultural Journey #{id}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      A beautiful story about traditions, family, and cultural heritage.
                    </p>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </MotionSection> */}

      {/* Footer Section */}
      {/* <Footer /> */}
    </div>
  )
}
