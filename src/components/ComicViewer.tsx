"use client"

import { useState } from "react"
import { ComicPanel } from "@/components/ComicPanel"
import { ChevronLeft, ChevronRight, Grid, Maximize2 } from "lucide-react"
import type { Panel } from "@/types/comic"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv } from "@/components/motion/motion"
import { AnimatedButton } from "@/components/animated-button"

interface ComicViewerProps {
  panels: Panel[]
}

export function ComicViewer({ panels }: ComicViewerProps) {
  const [currentView, setCurrentView] = useState<"grid" | "single">("grid")
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  const handlePrevPanel = () => {
    setCurrentPanelIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextPanel = () => {
    setCurrentPanelIndex((prev) => Math.min(panels.length - 1, prev + 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <AnimatedButton
          variant="outline"
          onClick={() => setCurrentView(currentView === "grid" ? "single" : "grid")}
          className="flex items-center gap-2"
        >
          {currentView === "grid" ? (
            <>
              <Maximize2 className="h-4 w-4" />
              View as Slideshow
            </>
          ) : (
            <>
              <Grid className="h-4 w-4" />
              View as Grid
            </>
          )}
        </AnimatedButton>
      </div>

      <AnimatePresence mode="wait">
        {currentView === "grid" ? (
          <MotionDiv
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {panels.map((panel, index) => (
              <ComicPanel key={panel.id} panel={panel} index={index + 1} />
            ))}
          </MotionDiv>
        ) : (
          <MotionDiv
            key="single-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPanelIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-purple-100 to-indigo-100 p-1 rounded-lg shadow-md"
              >
                <ComicPanel panel={panels[currentPanelIndex]} large index={currentPanelIndex + 1} />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center">
              <AnimatedButton
                variant="outline"
                onClick={handlePrevPanel}
                disabled={currentPanelIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </AnimatedButton>

              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
              >
                {currentPanelIndex + 1} of {panels.length}
              </motion.span>

              <AnimatedButton
                variant="outline"
                onClick={handleNextPanel}
                disabled={currentPanelIndex === panels.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </AnimatedButton>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
