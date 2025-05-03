"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/LanguageSelector"
import { ArrowRight, BookOpen, Palette, Globe, Users } from "lucide-react"
import {
  MotionDiv,
  MotionSection,
  MotionH1,
  MotionH2,
  MotionP,
  fadeIn,
  staggerContainer,
  slideIn,
} from "@/components/motion/motion"
import { AnimatedBackground } from "@/components/animated-background"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <MotionSection
        className="relative h-screen flex items-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.2, 0.1)}
      >
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-800 opacity-90" />
        <div className="relative px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <MotionH1
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
              variants={fadeIn(0.2, 0.7)}
            >
              <MotionDiv variants={slideIn("left", 0.3, 0.7)} className="block">
                Culture to Comic
              </MotionDiv>
              <MotionDiv variants={slideIn("right", 0.5, 0.7)} className="block text-purple-200 mt-2">
                Preserve Your Heritage
              </MotionDiv>
            </MotionH1>
            <MotionP className="mt-6 text-xl text-white opacity-90 max-w-2xl mx-auto" variants={fadeIn(0.7, 0.7)}>
              Transform your cultural stories and experiences into beautiful, shareable comics using AI technology.
            </MotionP>
            <MotionDiv className="mt-10 flex justify-center gap-4" variants={fadeIn(0.9, 0.7)}>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg bg-white text-purple-900 hover:bg-purple-100 relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-purple-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Button>
              </Link>
              <Link href="/submit">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg text-white border-white hover:bg-white/10"
                >
                  Create Comic
                </Button>
              </Link>
            </MotionDiv>
          </div>
        </div>
        <ScrollIndicator />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </MotionSection>

      {/* Features Section */}
      <MotionSection
        id="features"
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer(0.2, 0.1)}
      >
        <div className="text-center mb-16">
          <MotionH2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl" variants={fadeIn(0.2, 0.5)}>
            How It Works
          </MotionH2>
          <MotionP className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeIn(0.3, 0.5)}>
            Our platform uses cutting-edge AI to transform your cultural stories into visual narratives.
          </MotionP>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-purple-900" />,
              title: "Share Your Story",
              description: "Record your voice or type your cultural story, tradition, or experience.",
            },
            {
              icon: <Palette className="h-6 w-6 text-purple-900" />,
              title: "AI Transformation",
              description: "Our AI analyzes your story and generates comic panels with matching visuals.",
            },
            {
              icon: <Globe className="h-6 w-6 text-purple-900" />,
              title: "Translate & Share",
              description: "Translate your comic into multiple languages and share with friends and family.",
            },
            {
              icon: <Users className="h-6 w-6 text-purple-900" />,
              title: "Preserve Culture",
              description: "Help preserve cultural heritage by creating visual stories for future generations.",
            },
          ].map((feature, index) => (
            <AnimatedCard key={feature.title} delay={0.2 + index * 0.1}>
              <div className="h-full flex flex-col">
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </MotionSection>

      {/* Featured Comics Section */}
      <MotionSection
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
      </MotionSection>

      {/* CTA Section */}
      <MotionSection
        className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-900 text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer(0.2, 0.1)}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-700 opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-700 opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <MotionH2 className="text-3xl font-bold tracking-tight sm:text-4xl" variants={fadeIn(0.2, 0.5)}>
            Ready to share your story?
          </MotionH2>
          <MotionP className="mt-4 text-xl opacity-90 max-w-2xl mx-auto" variants={fadeIn(0.3, 0.5)}>
            Join our community and help preserve cultural heritage through visual storytelling.
          </MotionP>
          <MotionDiv className="mt-8 flex justify-center gap-4" variants={fadeIn(0.4, 0.5)}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="px-8 bg-white text-purple-900 hover:bg-purple-100 relative overflow-hidden group"
                >
                  <span className="relative z-10">Sign Up Now</span>
                  <span className="absolute inset-0 bg-purple-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Button>
              </Link>
            </motion.div>
            <div className="flex items-center">
              <span className="mr-2">Choose language:</span>
              <LanguageSelector />
            </div>
          </MotionDiv>
        </div>
      </MotionSection>
    </div>
  )
}
