"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export function AnimatedText({ texts, interval = 3000, className = "" }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className={`relative h-8 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          {texts[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
