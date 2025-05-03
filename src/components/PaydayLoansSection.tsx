"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PaydayLoansSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-16 bg-black px-4 md:px-8 lg:px-16 max-w-8xl mx-auto">
      <div className="max-w-9xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          PayDay Loans: what it is, advantages, how to apply, repayment options
        </h2>
        
        <p className="mb-6">
          There are situations in life when you need money urgently, for example, to pay for housing and utilities or repair equipment, but your paycheck is still far away. In such cases, payday loan becomes an effective assistant. A short-term loan allows you to get urgent monetary support, then quickly repay the loan with minimal interest.
        </p>
        
        <p className="mb-6">
          There are several ways to get a payday loan. The first one is standard and involves going to a bank. This method involves a large package of documents with certificates, which can be a time-consuming process. And there is a high probability that the banking institution will refuse to grant a loan or offer terms that are highly unfavorable to the borrower.
        </p>
        
        <p className="mb-6">
          The second is to order payday loans from the Lend Plus lending company. The MFI provides minimal requirements to clients, there is prolongation, and the package of required documents is minimal. For detailed consultation please contact +27 71 868 5388, managers of the financial company will choose the best loan for your needs.
        </p>
        
        <button 
          className="text-blue-400 hover:text-blue-300 transition mb-12"
          onClick={() => console.log("Read more clicked")}
        >
          Read more
        </button>
        
        <div className="border-t border-gray-700 pt-8">
          <div 
            className="flex items-center justify-between cursor-pointer mb-8"
            onClick={() => setIsOpen(!isOpen)}
          >
            <h3 className="text-xl md:text-2xl font-semibold">Personal loan options</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {loanOptions.map((option, index) => (
                <div 
                  key={index}
                  className="border border-gray-700 rounded-md p-4 text-center hover:bg-gray-800 transition cursor-pointer"
                >
                  {option}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const loanOptions = [
  "Short term loan",
  "Quick loans",
  "Loans for Blacklisted",
  "Urgent cash loans",
  "Cash Loan",
  "Debt Consolidation Loan"
];

export default PaydayLoansSection; 