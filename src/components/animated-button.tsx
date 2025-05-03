"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import React from "react"

export interface AnimatedButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  children: React.ReactNode
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button variant={variant} size={size} className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}
