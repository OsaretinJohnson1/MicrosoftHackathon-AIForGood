'use client';

import { useState } from 'react';
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import Header from "@/components/Header";


export default function AboutPage() {
    const [loanAmount, setLoanAmount] = useState(2000);
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
        window.location.href = `/apply?amount=${loanAmount}`;
    };

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative">
            <Header isLoggedIn={false} />
            <div className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content */}
                    <motion.div
                        className="lg:w-2/3"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h1
                            className="text-4xl font-bold mb-8"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >About us</motion.h1>

                        <motion.div
                            className="bg-stone-800 rounded-lg p-6 mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <motion.p
                                className="mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                Ubuntu Lend is a service for providing loans electronically, which does not require visiting the office
                                and providing unnecessary documents. Completing the application takes about 7 minutes.
                            </motion.p>

                            <motion.p
                                className="mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                If the application is approved, the money will be transferred to your account or bank card. We offer
                                our services to everyone who needs to get a loan quickly, without collateral, without lengthy
                                registration procedures and checks.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                Loyalty is the hallmark of our Company, and we are constantly working on the attractiveness of our
                                product. To confirm this, we constantly offer our regular Customers various promotions and loyalty
                                programs.
                            </motion.p>
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
    );
} 