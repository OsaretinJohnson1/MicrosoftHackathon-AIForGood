"use client"

import { motion } from "framer-motion"
import { Book } from "lucide-react"

export function AnimatedLogo() {
  const pathVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.div
      initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.2, rotate: 5 }}
      className="relative"
    >
      <Book className="h-6 w-6 text-purple-700" />
      <motion.div
        className="absolute -inset-2 rounded-full border-2 border-purple-300"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
    </motion.div>
  )
}
