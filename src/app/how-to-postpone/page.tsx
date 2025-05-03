'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import { useRouter } from 'next/navigation';


export default function HowToPostponePage() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);
  const minLoan = 500;
  const maxLoan = 4000;
  const step = 100;

  const increaseLoan = () => {
    if (loanAmount < maxLoan) {
      setLoanAmount(prev => Math.min(prev + step, maxLoan));
    }
  };

  const decreaseLoan = () => {
    if (loanAmount > minLoan) {
      setLoanAmount(prev => Math.max(prev - step, minLoan));
    }
  };

  const handleApplyLoan = () => {
    setIsLoading(true);
    // Simulate loading for 1.5 seconds before redirecting
    setTimeout(() => {
      setIsLoading(false);
      router.push('/auth/login?amount=' + loanAmount);
    }, 1500);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative">
      <Header isLoggedIn={false} />
      <motion.div 
        className="min-h-screen bg-black text-stone-100 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        

        {/* Background decorative elements with subtle animation */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-64 bg-[#fccf03]/10 -skew-y-6 transform -translate-y-32 z-0"
          animate={{ 
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 right-0 w-full h-64 bg-[#fccf03]/10 skew-y-6 transform translate-y-32 z-0"
          animate={{ 
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "reverse",
            delay: 2
          }}
        ></motion.div>
        
        {/* Floating decorative circles with animation */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
          animate={{ 
            x: [0, 15, 0],
            y: [0, 10, 0],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatType: "mirror" 
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-tr from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
          animate={{ 
            x: [0, -20, 0],
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            repeatType: "mirror" 
          }}
        ></motion.div>

        <div className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
          <motion.h1 
            className="text-4xl font-bold mb-8 text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >How to postpone a loan?</motion.h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div 
              className="lg:w-2/3"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              {/* Main calendar image */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <Image 
                  src="/calender2.avif" 
                  alt="Calendar showing postponement" 
                  width={800} 
                  height={500} 
                  className="w-full rounded-md"
                />
              </motion.div>
              
              {/* Policy text */}
              <motion.div 
                className="space-y-6 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <p className="text-lg">
                  We build a flexible policy for relationships with clients and in the current situation we help to defer 
                  (extend) the loan; you can defer (restructure) the term of the Loan Agreement if this is necessary and 
                  you do not meet the originally chosen deadline. You can use this service 2 days before the loan expires.
                </p>
                
                <p className="text-xl font-semibold mt-6">To extend the loan you must:</p>
                
                <motion.ul 
                  className="list-disc pl-6 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Submit an application in your personal account;</motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Pay the amount of accrued interest and commissions;</motion.li>
                  <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>To sign an agreement.</motion.li>
                </motion.ul>
              </motion.div>
            </motion.div>
            
            {/* Loan Calculator Widget */}
            <motion.div 
              className="lg:w-1/3 md:sticky md:top-16 h-fit self-start"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 shadow-lg border border-stone-700">
                <h3 className="text-xl font-semibold mb-4 text-amber-100">Loan amount</h3>
                
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center justify-between mb-3 shadow-inner">
                  <button 
                    className="bg-[#fccf03] hover:bg-[#e0b800] active:bg-[#d6af00] rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md"
                    onClick={decreaseLoan}
                  >
                    <span className="text-black text-lg">-</span>
                  </button>
                  <span className="text-xl font-bold text-white">R {loanAmount.toLocaleString()}</span>
                  <button 
                    className="bg-[#fccf03] hover:bg-[#e0b800] active:bg-[#d6af00] rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md"
                    onClick={increaseLoan}
                  >
                    <span className="text-black text-lg">+</span>
                  </button>
                </div>
                
                <div className="flex justify-between text-xs text-stone-400 mb-5 px-2">
                  <span>R {minLoan.toLocaleString()}</span>
                  <span>R {maxLoan.toLocaleString()}</span>
                </div>
                
                <motion.button 
                  className="w-full bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black py-3 px-6 rounded-full font-medium transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={handleApplyLoan}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply for a loan
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
        
        <Footer />
      </motion.div>
    </motion.div>
  );
} 