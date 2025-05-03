"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface FloatingAnimationProps {
  children: ReactNode
  duration?: number
  delay?: number
  yOffset?: number
  className?: string
}

export function FloatingAnimation({
  children,
  duration = 4,
  delay = 0,
  yOffset = 10,
  className = "",
}: FloatingAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-yOffset / 2, yOffset / 2, -yOffset / 2],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
