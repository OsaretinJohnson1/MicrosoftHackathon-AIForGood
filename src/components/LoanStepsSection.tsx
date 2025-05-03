"use client";

import React from 'react';
import { motion } from "framer-motion";

const LoanStepsSection = () => {
  const steps = [
    {
      number: 1,
      title: "Create an online profile on our website by following the simple steps",
      description: "You can leave a request by filling out the form"
    },
    {
      number: 2,
      title: "Wait for the decision",
      description: "We make use of TruID – a secure platform that safely sends us your proof of income on your behalf with your consent"
    },
    {
      number: 3,
      title: "Approval of the loan amount",
      description: "A credit limit will be granted once we have verified your details and conducted credit checks"
    },
    {
      number: 4,
      title: "Receive money",
      description: "Accept your credit offer as well as the debicheck mandate and your loan will be deposited into your account"
    }
  ];

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Easy steps to get a loan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-gray-800 rounded-lg p-6 relative"
            >
              <div className="bg-[#fccf03] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.a 
            href="#apply" 
            className="bg-[#fccf03] hover:bg-[#e0b902] text-white font-bold py-4 px-10 rounded-lg inline-block text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply for a loan
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default LoanStepsSection; 