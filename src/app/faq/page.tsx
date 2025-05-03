'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon, MinusIcon, PlusIcon } from 'lucide-react';
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import Header from "@/components/Header";
import { useRouter } from 'next/navigation';


// FAQ Accordion component
const FAQItem: React.FC<{ question: string; children: ReactNode }> = ({ question, children }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<motion.div
			className="mb-4"
			whileHover={{ scale: 1.01 }}
			transition={{ type: "spring", stiffness: 400 }}
		>
			<motion.button
				className="w-full bg-stone-900 text-white p-6 text-left rounded flex justify-between items-center"
				onClick={() => setIsOpen(!isOpen)}
				whileTap={{ scale: 0.98 }}
			>
				<h3 className="text-xl font-medium">{question}</h3>
				<ChevronDownIcon
					className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</motion.button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="p-6 bg-stone-800 text-stone-200 rounded-b"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

// Loan calculator component
const LoanCalculator = () => {
	const router = useRouter();
	const [amount, setAmount] = useState(2000);
	const [isLoading, setIsLoading] = useState(false);
	const min = 500;
	const max = 4000;

	const decrease = () => {
		if (amount > min) {
			setAmount(Math.max(amount - 100, min));
		}
	};

	const increase = () => {
		if (amount < max) {
			setAmount(Math.min(amount + 100, max));
		}
	};

	const handleApplyLoan = () => {
		setIsLoading(true);
		// Simulate loading for 1.5 seconds before redirecting
		setTimeout(() => {
			setIsLoading(false);
			router.push('/auth/login?amount=' + amount);
		}, 1500);
	};

	return (
		<motion.div
			className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 shadow-lg border border-stone-700 md:sticky md:top-16"
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: 0.5, duration: 0.8 }}
		>
			<h2 className="text-xl font-semibold mb-4 text-amber-100">Loan amount</h2>

			<div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center justify-between mb-3 shadow-inner">
				<motion.button
					onClick={decrease}
					className="bg-[#fccf03] hover:bg-[#e6bc03] active:bg-[#d3ab02] rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md"
					whileTap={{ scale: 0.9 }}
				>
					<span className="text-black text-lg">-</span>
				</motion.button>
				<div className="text-xl font-bold text-white">R {amount.toLocaleString()}</div>
				<motion.button
					onClick={increase}
					className="bg-[#fccf03] hover:bg-[#e6bc03] active:bg-[#d3ab02] rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md"
					whileTap={{ scale: 0.9 }}
				>
					<span className="text-black text-lg">+</span>
				</motion.button>
			</div>

			<motion.input
				type="range"
				min={min}
				max={max}
				value={amount}
				onChange={(e) => setAmount(Number(e.target.value))}
				className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#fccf03] mb-2"
				whileHover={{ scale: 1.02 }}
			/>

			<div className="flex justify-between text-xs text-stone-400 mb-5 px-2">
				<span>R {min.toLocaleString()}</span>
				<span>R {max.toLocaleString()}</span>
			</div>

			<motion.button
				onClick={handleApplyLoan}
				className="w-full bg-[#fccf03] hover:bg-[#e6bc03] active:bg-[#d3ab02] text-black py-3 px-6 rounded-full font-medium transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				disabled={isLoading}
			>
				{isLoading ? 'Processing...' : 'Apply for a loan'}
			</motion.button>
		</motion.div>
	);
};

export default function FAQ() {
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

	const item = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="min-h-screen bg-black text-stone-100 relative overflow-hidden"
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
				<motion.h1
					className="text-4xl font-bold mb-12 text-white"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
				>FAQ</motion.h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<motion.div
						className="lg:col-span-2"
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
					>
						<motion.div variants={item}><FAQItem question="How to get a loan?">
							<p>To get a loan, you need to complete our online application form, provide the required documentation, and pass our credit assessment. Once approved, funds will be disbursed directly to your bank account.</p>
						</FAQItem></motion.div>

						<motion.div variants={item}><FAQItem question="What do I need to apply?">
							<p>To apply for a loan, you'll need to provide:</p>
							<ul className="list-disc pl-5 mt-2">
								<li>Valid South African ID</li>
								<li>Proof of income (latest payslip)</li>
								<li>3 months bank statements</li>
								<li>Active South African bank account</li>
							</ul>
						</FAQItem></motion.div>

						<motion.div variants={item}><FAQItem question="What is debicheck?">
							<p>DebiCheck is a debit order system required by the South African Reserve Bank. It requires you to electronically confirm and authorize debit orders with your bank before they can be processed against your account.</p>
						</FAQItem></motion.div>

						<motion.div variants={item}><FAQItem question="When is my loan due date?">
							<p>Your loan repayment due date is typically aligned with your salary date. You can view your specific due date in your loan agreement or by logging into your account dashboard.</p>
						</FAQItem></motion.div>

						<motion.div variants={item}><FAQItem question="When can I get loan?">
							<p>After your application is approved, funds are typically disbursed within 24 hours on business days. Most clients receive their funds on the same day of approval if all requirements are met.</p>
						</FAQItem></motion.div>

						<motion.div variants={item}><FAQItem question="How do I check the payment amount?">
							<p>You can check your payment amount by logging into your account dashboard, reviewing your loan agreement, or contacting our customer service team at +27 71 868 5388.</p>
						</FAQItem></motion.div>
					</motion.div>

					<div className="lg:col-span-1">
						<LoanCalculator />
					</div>
				</div>
			</div>

			<Footer />
		</motion.div>
	);
} 