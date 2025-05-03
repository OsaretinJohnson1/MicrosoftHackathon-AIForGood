'use client';

import React from 'react';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import Header from "../../components/Header";


export default function ContactPage() {
  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative">
      <Header isLoggedIn={false} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black min-h-screen text-white py-8 px-4 relative overflow-hidden"
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

        <div className="container mx-auto max-w-6xl mb-16 relative z-10">
          <motion.h1 
            className="text-4xl font-bold mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >Contact us</motion.h1>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* General Customer Service */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">General Customer Service</h2>
                <p className="text-white font-medium">+27 71 868 5388</p>
              </div>
            </motion.div>

            {/* Certificate of balance requests */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Certificate of balance requests</h2>
                <p className="text-white font-medium">cob@lendplus.co.za</p>
              </div>
            </motion.div>

            {/* Debt review proposals */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Debt review proposals</h2>
                <p className="text-white font-medium">proposals@lendplus.co.za</p>
              </div>
            </motion.div>

            {/* Debt Review Refunds */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Debt Review Refunds</h2>
                <p className="text-white font-medium">drrefunds@lendplus.co.za</p>
              </div>
            </motion.div>

            {/* Reckless lending matters */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Reckless lending matters</h2>
                <p className="text-white font-medium">recklesslending@lendplus.co.za</p>
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Schedule</h2>
                <p className="text-white font-medium">Monday-Friday: 8am - 5pm</p>
              </div>
            </motion.div>

            {/* Weekend schedule */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Weekend schedule</h2>
                <p className="text-white font-medium">Saturday: 8am - 1pm</p>
              </div>
            </motion.div>

            {/* Facebook page */}
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg p-6"
              variants={cardVariant}
              whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <motion.div 
                  className="bg-[#fccf03]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ backgroundColor: "#fccf03/30", scale: 1.1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fccf03]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
                <h2 className="text-gray-300 mb-2">Facebook page</h2>
                <p className="text-white font-medium">fb.com/lendplus</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <Footer />
      </motion.div>
    </motion.div>
  );
} 