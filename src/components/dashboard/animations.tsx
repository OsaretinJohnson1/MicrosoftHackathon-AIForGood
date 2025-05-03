"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Animated Title component
export const AnimatedTitle = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Last updated: April 16, 2025</p>
      </div>
    </motion.div>
  );
};

// Animated Card component
export const AnimatedCard = ({ children, index, className }: { 
  children: React.ReactNode;
  index: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated Button component
export const AnimatedButton = ({ children, className, variant, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 p-3 hover:bg-[#a8a832]/5 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};

// Animated counter for numbers
export const Counter = ({ value, duration = 2 }: { 
  value: string | number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace(/,/g, ''));
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <>{typeof value === 'string' && value.includes(',') ? count.toLocaleString() : count}</>;
};

// AnimatedTableRow component
export const AnimatedTableRow = ({ children, index }: { 
  children: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
    >
      {children}
    </motion.tr>
  );
}; 