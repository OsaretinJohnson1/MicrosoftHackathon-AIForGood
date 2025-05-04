"use client"

import { useState, useEffect } from "react"
import { ComicPanel } from "@/components/ComicPanel"
import { ChevronLeft, ChevronRight, Grid, Maximize2 } from "lucide-react"
import type { Panel } from "@/types/comic"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv } from "@/components/motion/motion"
import { AnimatedButton } from "@/components/animated-button"
import { TTSButton } from "./TTSButton";

interface ComicViewerProps {
  panels: Panel[];
  comicText?: string;
  defaultLanguage?: string;
}

export function ComicViewer({ 
  panels, 
  comicText = "", 
  defaultLanguage = "en" 
}: ComicViewerProps) {
  const [currentView, setCurrentView] = useState<"grid" | "single">("grid");
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [selectedText, setSelectedText] = useState(comicText);
  const [language, setLanguage] = useState(defaultLanguage);

  // Update selected text when comicText changes
  useEffect(() => {
    setSelectedText(comicText);
  }, [comicText]);

  const handleTextSelection = () => {
    // Get text selected by user
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      setSelectedText(selection);
    } else {
      setSelectedText(comicText);
    }
  };

  const handlePrevPanel = () => {
    setCurrentPanelIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPanel = () => {
    setCurrentPanelIndex((prev) => Math.min(panels.length - 1, prev + 1));
  };

  return (
    <div className="space-y-6" onClick={handleTextSelection}>
      {comicText && (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="mb-4 text-lg">{comicText}</p>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {selectedText === comicText 
                  ? "Full story will be read" 
                  : "Selected text will be read"}
              </p>
              {selectedText !== comicText && (
                <p className="text-sm text-gray-500 truncate" title={selectedText}>
                  "{selectedText.length > 50 
                    ? `${selectedText.substring(0, 50)}...` 
                    : selectedText}"
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="en">English</option>
                <option value="xh">isiXhosa</option>
                <option value="zu">isiZulu</option>
                <option value="st">Sesotho</option>
              </select>
              <TTSButton 
                text={selectedText} 
                language={language}
                className="px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of the ComicViewer component remains the same */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCurrentView(currentView === "grid" ? "single" : "grid")}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
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
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentView === "grid" ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {panels.map((panel, index) => (
              <ComicPanel 
                key={panel.id} 
                panel={panel} 
                index={index + 1} 
                onClick={handleTextSelection}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
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
                <ComicPanel 
                  panel={panels[currentPanelIndex]} 
                  large 
                  index={currentPanelIndex + 1} 
                  onClick={handleTextSelection}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevPanel}
                disabled={currentPanelIndex === 0}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                {currentPanelIndex + 1} of {panels.length}
              </span>

              <button
                onClick={handleNextPanel}
                disabled={currentPanelIndex === panels.length - 1}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
