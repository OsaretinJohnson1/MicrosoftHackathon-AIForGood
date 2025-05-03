"use client"

import { motion } from "framer-motion"

export function LoadingAnimation() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const dotVariants = {
    initial: { y: 0, opacity: 0.2 },
    animate: {
      y: [-10, 0],
      opacity: [0.2, 1, 0.2],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1,
      },
    },
  }

  return (
    <motion.div
      className="flex items-center justify-center gap-2"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-purple-600"
          variants={dotVariants}
          transition={{ delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  )
}
