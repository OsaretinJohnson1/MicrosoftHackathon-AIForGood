"use client"

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
    dashboardUrl: string;
    host?: string | null;
}

// Enhanced money-themed loader component
const MoneyLoader = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;
    
    return (
        <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="relative flex flex-col items-center">
                {/* Rain of coins animation */}
                <div className="absolute w-full h-full overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div 
                            key={i}
                            className="absolute"
                            initial={{ 
                                x: Math.random() * window.innerWidth, 
                                y: -50,
                                rotate: Math.random() * 360
                            }}
                            animate={{ 
                                y: window.innerHeight + 50,
                                rotate: Math.random() * 720
                            }}
                            transition={{ 
                                duration: 1 + Math.random() * 1.5,
                                repeat: Infinity,
                                delay: Math.random() * 0.5,
                                ease: "linear"
                            }}
                        >
                            <div className="w-8 h-8 bg-[#fccf03] rounded-full border-2 border-[#e0b902] shadow-md flex items-center justify-center">
                                <span className="text-black font-bold text-xs">R</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                {/* Central loader element */}
                <motion.div 
                    className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-[0_0_30px_rgba(0,255,0,0.5)] flex items-center justify-center z-10"
                    animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 360],
                    }}
                    transition={{ 
                        scale: {
                            repeat: Infinity,
                            duration: 1.5
                        },
                        rotate: {
                            repeat: Infinity,
                            duration: 30,
                            ease: "linear"
                        }
                    }}
                >
                    <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2
                            }}
                            className="text-[#fccf03] font-bold text-4xl"
                        >
                            R
                        </motion.div>
                    </div>
                </motion.div>
                
                {/* Processing bar */}
                <div className="mt-10 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-[#fccf03]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "loop" 
                        }}
                    />
                </div>
                
                <motion.p 
                    className="text-white text-center mt-6 font-semibold text-lg"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    Processing your instant cash loan...
                </motion.p>
            </div>
        </motion.div>
    );
};

export default function HeroSection({ dashboardUrl, host }: HeroSectionProps) {
    const router = useRouter();
    const [loanAmount, setLoanAmount] = useState(2000);
    const [isLoading, setIsLoading] = useState(false);
    const [headingIndex, setHeadingIndex] = useState(0);
    
    const headings = [
        {
            title: "Quick loans",
            highlight: "15 minutes!"
        },
        {
            title: "Zero paperwork",
            highlight: "fully digital!"
        },
        {
            title: "Fast approvals",
            highlight: "same day!"
        },
        {
            title: "Low rates",
            highlight: "clear terms!"
        },
        {
            title: "Secure lending",
            highlight: "trusted!"
        }
    ];
    
    useEffect(() => {
        const interval = setInterval(() => {
            setHeadingIndex(prev => (prev + 1) % headings.length);
        }, 6000);
        
        return () => clearInterval(interval);
    }, []);
    
    const minLoan = 500;
    const maxLoan = 4000;
    
    const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoanAmount(Number(e.target.value));
    };
    
    const decreaseLoan = () => {
        setLoanAmount(prev => Math.max(prev - 100, minLoan));
    };
    
    const increaseLoan = () => {
        setLoanAmount(prev => Math.min(prev + 100, maxLoan));
    };
    
    const handleApplyLoan = () => {
        setIsLoading(true);
        // Simulate loading for 1.5 seconds before redirecting
        setTimeout(() => {
            setIsLoading(false);
            router.push('/auth/login');
        }, 1500);
    };
    
    // Format the loan amount with commas
    const formattedLoanAmount = `R${loanAmount.toLocaleString()}`;
    
    return (
        <>
            <AnimatePresence>
                <MoneyLoader isVisible={isLoading} />
            </AnimatePresence>
            
            <motion.section 
                className="py-20 relative overflow-hidden bg-black bg-cover bg-center"
                style={{ backgroundImage: 'url(/loan.jpeg)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Alternative approach using Image component with absolute positioning */}
                {/* 
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="/loan.jpeg" 
                        alt="Loan background" 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        priority
                    />
                </div>
                */}
                
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="flex flex-col items-start">
                        <div className="max-w-xl w-full text-left">
                            <motion.div
                                key={headingIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="h-32" // Fixed height to prevent layout shifts
                            >
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    {headings[headingIndex].title}<br />
                                    from just <span className="text-[#fccf03]">{headings[headingIndex].highlight}</span>
                                </h1>
                            </motion.div>
                            
                            <motion.p 
                                className="text-xl mb-8 text-gray-300"
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                            >
                                Get funds in your account quickly with our streamlined application process.
                            </motion.p>
                            
                            <motion.div 
                                className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg mb-8"
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <p className="mb-4">Loan amount</p>
                                <div className="flex items-center justify-between mb-2">
                                    <button 
                                        className="bg-gray-700 p-2 rounded-full"
                                        onClick={decreaseLoan}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <span className="text-2xl font-bold">{formattedLoanAmount}</span>
                                    <button 
                                        className="bg-[#fccf03] p-2 rounded-full"
                                        onClick={increaseLoan}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                                        </svg>
                                    </button>
                                </div>
                                <input 
                                    type="range" 
                                    min={minLoan}
                                    max={maxLoan}
                                    step="100"
                                    value={loanAmount}
                                    onChange={handleLoanChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                                />
                                <div className="flex justify-between mt-2 text-sm text-gray-400">
                                    <span>R500</span>
                                    <span>R4,000</span>
                                </div>
                                <motion.button 
                                    className="w-full bg-[#fccf03] hover:bg-[#e0b902] py-3 px-8 rounded-lg mt-6 font-bold transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <a href="/auth/login" onClick={(e) => {
                                        e.preventDefault(); // Prevent default link behavior
                                        handleApplyLoan(); // Use our custom handler with loader
                                    }}>
                                        Apply for a loan
                                    </a>
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
}