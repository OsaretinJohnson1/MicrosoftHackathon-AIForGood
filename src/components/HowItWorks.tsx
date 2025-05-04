"use client"

import {
  MotionSection,
  MotionH2,
  MotionP,
  fadeIn,
  staggerContainer,
} from "@/components/motion/motion"
import { AnimatedCard } from "@/components/animated-card"
import { BookOpen, Palette, Globe, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"

// Add TypewriterText component
const TypewriterText = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const componentRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (componentRef.current) {
      observer.observe(componentRef.current);
    }
    
    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, [started]);
  
  useEffect(() => {
    if (!started) return;
    
    let index = 0;
    const timer = setTimeout(() => {
      const intervalId = setInterval(() => {
        setDisplayText(text.substring(0, index + 1));
        index++;
        
        if (index >= text.length) {
          clearInterval(intervalId);
        }
      }, 30); // Speed of typing
      
      return () => clearInterval(intervalId);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [text, started, delay]);
  
  return <p ref={componentRef} className={className}>{displayText}<span className="animate-pulse">|</span></p>;
};

export const HowItWorks = () => {
  return (
    <MotionSection
      id="features"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer(0.2, 0.1)}
    >
      <div className="text-center mb-20">
        <div className="inline-block mb-3">
          <span className="bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
            Our Process
          </span>
        </div>
        <MotionH2 
          className="text-4xl font-bold tracking-tight text-primary sm:text-5xl background-clip-text" 
          variants={fadeIn(0.2, 0.5)}
        >
          How It Works
        </MotionH2>
        <MotionP 
          className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto" 
          variants={fadeIn(0.3, 0.5)}
        >
          <TypewriterText 
            text="Our platform uses cutting-edge AI to transform your cultural stories into visual narratives." 
            className="inline-block"
            delay={0.5}
          />
        </MotionP>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <BookOpen className="h-8 w-8" />,
            color: "from-blue-500 to-indigo-600",
            title: "Share Your Story",
            description: "Record your voice or type your cultural story, tradition, or experience.",
          },
          {
            icon: <Palette className="h-8 w-8" />,
            color: "from-pink-500 to-purple-600",
            title: "AI Transformation",
            description: "Our AI analyzes your story and generates comic panels with matching visuals.",
          },
          {
            icon: <Globe className="h-8 w-8" />,
            color: "from-amber-500 to-orange-600",
            title: "Translate & Share",
            description: "Translate your comic into multiple languages and share with friends and family.",
          },
          {
            icon: <Users className="h-8 w-8" />,
            color: "from-emerald-500 to-teal-600",
            title: "Preserve Culture",
            description: "Help preserve cultural heritage by creating visual stories for future generations.",
          },
        ].map((feature, index) => (
          <AnimatedCard 
            key={feature.title} 
            delay={0.2 + index * 0.1}
            className="group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-full flex flex-col p-5 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
              <div className={`rounded-xl bg-gradient-to-br ${feature.color} w-16 h-16 flex items-center justify-center mb-6 shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </MotionSection>
  )
} 