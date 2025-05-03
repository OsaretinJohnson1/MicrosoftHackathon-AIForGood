"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const faqItems = [
  { 
    question: "How to get a loan?",
    answer: "To get a loan, you need to complete our online application form, provide the required documentation, and pass our credit assessment. Once approved, funds will be disbursed directly to your bank account."
  },
  { 
    question: "What do I need to apply?",
    answer: "To apply for a loan, you'll need to provide: Valid South African ID, Proof of income (latest payslip), 3 months bank statements, and an Active South African bank account."
  },
  { 
    question: "What is debicheck?",
    answer: "DebiCheck is a debit order system required by the South African Reserve Bank. It requires you to electronically confirm and authorize debit orders with your bank before they can be processed against your account."
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section 
      className="py-16 bg-gray-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          FAQ
        </motion.h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-800 rounded-lg overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="p-4 flex justify-between items-center cursor-pointer"
                whileHover={{ backgroundColor: "#374151" }}
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <motion.div 
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
                  whileHover={{ backgroundColor: "#4B5563" }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.div>
              {openIndex === index && (
                <motion.div 
                  className="p-4 bg-stone-800 text-stone-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.a 
            href="/faq" 
            className="text-[#fccf03] hover:text-[#e0b902]"
            whileHover={{ scale: 1.05 }}
          >
            See more
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
} 