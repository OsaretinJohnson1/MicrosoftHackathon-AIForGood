"use client"

import { useState } from "react"
import { ComicPanel } from "@/components/ComicPanel"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Grid, Maximize2 } from "lucide-react"
import type { Panel } from "@/types/comic"

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
        <Button
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
        </Button>
      </div>

      {currentView === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panels.map((panel, index) => (
            <ComicPanel key={panel.id} panel={panel} index={index + 1} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-1 rounded-lg shadow-md">
            <ComicPanel panel={panels[currentPanelIndex]} large index={currentPanelIndex + 1} />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevPanel}
              disabled={currentPanelIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {currentPanelIndex + 1} of {panels.length}
            </span>

            <Button
              variant="outline"
              onClick={handleNextPanel}
              disabled={currentPanelIndex === panels.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
