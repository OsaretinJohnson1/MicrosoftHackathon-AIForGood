"use client"

import { motion } from "framer-motion"

export const fadeIn = (delay = 0, duration = 0.5) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration,
      ease: "easeOut",
    },
  },
})

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const slideIn = (direction: "left" | "right" | "up" | "down", delay = 0, duration = 0.5) => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "tween",
        delay,
        duration,
        ease: "easeOut",
      },
    },
  }
}

export const scale = (delay = 0, duration = 0.5) => ({
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay,
      duration,
      ease: "easeOut",
    },
  },
})

export const MotionDiv = motion.div
export const MotionSection = motion.section
export const MotionHeader = motion.header
export const MotionFooter = motion.footer
export const MotionButton = motion.button
export const MotionH1 = motion.h1
export const MotionH2 = motion.h2
export const MotionP = motion.p
export const MotionSpan = motion.span
export const MotionUl = motion.ul
export const MotionLi = motion.li
export const MotionA = motion.a
export const MotionImg = motion.img
