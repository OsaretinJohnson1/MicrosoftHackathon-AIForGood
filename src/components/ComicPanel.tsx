"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Panel } from "@/types/comic"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface ComicPanelProps {
  panel: Panel
  large?: boolean
  index?: number
  onClick?: () => void
}

export function ComicPanel({ panel, large = false, index }: ComicPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay: index ? index * 0.1 : 0 }}
    >
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-purple-100">
        <div className={`relative ${large ? "aspect-[4/3]" : "aspect-square"}`}>
          {index && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.2 }}
              className="absolute top-2 left-2 z-10 bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {index}
            </motion.div>
          )}
          <motion.div
            className="absolute inset-0 bg-purple-900"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            src={panel.imageUrl || "/placeholder.svg"}
            alt={`Comic panel: ${panel.caption}`}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent
          className={`p-4 bg-gradient-to-r from-purple-50 to-white ${large ? "border-t border-purple-100" : ""}`}
        >
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`${large ? "text-lg" : "text-sm"} text-gray-800 font-medium`}
          >
            {panel.caption}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
