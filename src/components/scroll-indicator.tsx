"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function ScrollIndicator() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      onClick={scrollToFeatures}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        className="flex flex-col items-center text-white"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
      >
        <span className="text-sm font-medium mb-2">Scroll to explore</span>
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </motion.div>
  )
}
