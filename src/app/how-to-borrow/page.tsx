'use client'

import Link from 'next/link';
import Footer from "@/components/Footer";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import { useRouter } from 'next/navigation';


export default function HowToBorrowPage() {
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-50">
        <Header isLoggedIn={false} />
      </div>

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

      <div className="container mx-auto px-4 max-w-6xl pt-16 pb-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <motion.div
            className="flex-1"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              How to borrow?
            </motion.h1>

            <motion.p
              className="mb-8 text-stone-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Online credit is an ideal way to quickly solve a sudden need for financial resources. You can get a loan
              from Ubuntu Lend online from your home or workplace. There is no need to come to the office. Just visit our
              site through your phone, laptop or tablet.
            </motion.p>

            {/* Steps */}
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Step 1 */}
              <motion.div
                className="bg-stone-800 rounded-lg p-6"
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#fccf03] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xl">1</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-white">Choose the loan amount and term</h2>
                    <p className="text-stone-300">You can leave a request by filling out the form</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="bg-stone-800 rounded-lg p-6"
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#fccf03] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xl">2</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-white">Wait for the decision</h2>
                    <p className="text-stone-300">The decision is made in just 30 minutes</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="bg-stone-800 rounded-lg p-6"
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#fccf03] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xl">3</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-white">Receive money</h2>
                    <p className="text-stone-300">Get money to your account from 1 hour</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Loan Calculator Widget - Lowered Position */}
          <motion.div
            className="md:w-96 md:sticky md:top-16 h-fit self-start"
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
  );
} 