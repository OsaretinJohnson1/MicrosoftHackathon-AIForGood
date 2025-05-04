"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"
import { ScrollIndicator } from "@/components/scroll-indicator"
import {
  MotionDiv,
  MotionSection,
  MotionH1,
  MotionP,
  fadeIn,
  staggerContainer,
  slideIn,
} from "@/components/motion/motion"
import { useEffect, useState, useRef } from "react"
import { ComicLoader } from "@/components/ComicLoader"

export function HeroSection() {
  const [displayText, setDisplayText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [headlinePhrase, setHeadlinePhrase] = useState("Preserve Your Heritage");
  const headlinePhrases = [
    "Preserve Your Heritage",
    "Share Your Stories",
    "Animate Your Traditions",
    "Visualize Your Culture",
    "Digitize Your History"
  ];
  const fullText = "Transform your cultural stories and experiences into beautiful, shareable comics using AI technology.";
  const isTyping = useRef(true);
  const textIndex = useRef(0);
  const isPaused = useRef(false);
  const pauseCounter = useRef(0);

  useEffect(() => {
    // Headline phrase rotation effect
    let phraseIndex = 0;
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % headlinePhrases.length;
      setHeadlinePhrase(headlinePhrases[phraseIndex]);
    }, 6000);

    return () => clearInterval(phraseInterval);
  }, []);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isPaused.current) {
        pauseCounter.current += 1;
        if (pauseCounter.current >= 20) { // Pause for ~2 seconds (20 * 100ms)
          isPaused.current = false;
          pauseCounter.current = 0;
          isTyping.current = false; // Start deleting
        }
        return;
      }

      if (isTyping.current) {
        // Typing forward
        textIndex.current += 1;
        setDisplayText(fullText.substring(0, textIndex.current));
        
        if (textIndex.current >= fullText.length) {
          isPaused.current = true;
        }
      } else {
        // Deleting
        textIndex.current -= 1;
        setDisplayText(fullText.substring(0, textIndex.current));
        
        if (textIndex.current <= 0) {
          isTyping.current = true; // Start typing again
        }
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading time before navigation
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/signup";
    }, 2500);
  };

  return (
    <MotionSection
      className="relative h-screen flex items-center"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.2, 0.1)}
    >
      <AnimatedBackground />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/heritage-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 b opacity-90 z-10" />
      <div className="relative px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8 max-w-7xl mx-auto z-20">
        <div className="max-w-3xl mx-auto text-center">
          <MotionH1
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
            variants={fadeIn(0.2, 0.7)}
          >
            <MotionDiv 
              variants={slideIn("left", 0.3, 0.7)} 
              className="block font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100 font-serif"
            >
              Culture to Comic
            </MotionDiv>
            <MotionDiv 
              variants={slideIn("right", 0.5, 0.7)} 
              className="block mt-2 font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 drop-shadow-lg font-mono"
            >
              {headlinePhrase}
            </MotionDiv>
          </MotionH1>
          <MotionP className="mt-6 text-xl text-white opacity-90 max-w-2xl mx-auto h-[60px] flex items-center justify-center" variants={fadeIn(0.7, 0.7)}>
            {displayText}<span className="animate-pulse ml-1 border-r-2 border-white h-6 inline-block"></span>
          </MotionP>
          <MotionDiv className="mt-10 flex flex-col items-center" variants={fadeIn(0.9, 0.7)}>
            {isLoading ? (
              <div className="mb-6">
                <ComicLoader />
                <p className="text-white mt-3 animate-pulse">Creating your comic adventure...</p>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg relative overflow-hidden group transition-all duration-300 
                          bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
                          text-white shadow-lg hover:shadow-purple-500/30 rounded-xl hover:scale-105 transform"
                  onClick={handleGetStarted}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 rounded-xl" />
                </Button>
                
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg relative overflow-hidden group transition-all duration-300 
                            border-2 border-purple-400 text-white hover:text-purple-100 
                            hover:border-purple-300 rounded-xl hover:scale-105 transform backdrop-blur-sm"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Create Comic
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 
                                group-hover:translate-x-0 transition-all duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 transform scale-x-0 
                                  group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-xl" />
                  </Button>
                </Link>
              </div>
            )}
          </MotionDiv>
        </div>
      </div>
      <ScrollIndicator />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </MotionSection>
  )
} 