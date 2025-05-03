'use client'

import React from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import Header from "@/components/Header";
import { useRouter } from 'next/navigation';



export default function HowToRepayPage() {
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
			className="min-h-screen bg-black text-stone-100 relative overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative z-50">
				<Header isLoggedIn={false} />
			</div>

			{/* Simplified background elements */}
			<motion.div
				className="absolute top-0 left-0 w-full h-64 bg-[#fccf03]/10 -skew-y-6 transform -translate-y-32 z-0"
				animate={{ opacity: [0.7, 0.9, 0.7] }}
				transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
			></motion.div>

			{/* Reduced floating decorative elements */}
			<motion.div
				className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
				animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
				transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
			></motion.div>

			<div className="container mx-auto px-4 max-w-6xl py-16 relative z-10">
				<div className="flex flex-col md:flex-row gap-8">
					{/* Main Content - Reduced width to give more space for fixed calculator */}
					<motion.div
						className="flex-1 max-w-3xl"
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						transition={{ duration: 0.6 }}
					>
						<motion.h1
							className="text-4xl font-bold mb-4"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.7 }}
						>
							How to repay?
						</motion.h1>

						<motion.p
							className="mb-5 text-stone-300"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.7 }}
						>
							We make our repayment process simple and convenient for all customers.
						</motion.p>

						{/* Repayment Methods - Simplified */}
						<motion.div
							className="space-y-5"
							variants={staggerContainer}
							initial="hidden"
							animate="visible"
						>
							{/* Method 1 */}
							<motion.div
								className="bg-stone-800 rounded-lg p-5"
								variants={fadeIn}
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<div className="flex items-start gap-4">
									<div className="bg-[#fccf03] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
										<span className="text-black font-bold text-lg">1</span>
									</div>
									<div>
										<h2 className="text-xl font-bold mb-2">Debit order deduction</h2>
										<p className="text-stone-300 text-sm">
											We set up automatic debit order deductions from your verified bank account.
											Ensure sufficient funds are available on the due date.
										</p>
									</div>
								</div>
							</motion.div>

							{/* Method 2 - Condensed */}
							{/* <motion.div
								className="bg-stone-800 rounded-lg p-5"
								variants={fadeIn}
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<div className="flex items-start gap-4">
									<div className="bg-[#fccf03] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
										<span className="text-black font-bold text-lg">2</span>
									</div>
									<div>
										<h2 className="text-xl font-bold mb-2">Payment through OZOW</h2>
										<p className="text-stone-300 text-sm mb-3">
											Repay your loan faster and more conveniently online using OZOW.
										</p>

										<ul className="list-disc pl-6 mb-3 space-y-1 text-stone-300 text-sm">
											<li>Use "Repay online" in your account</li>
											<li>Click the repayment link in notifications</li>
											<li>Pay directly through the OZOW website</li>
										</ul>

										<div className="grid grid-cols-4 gap-2 mb-2">
											<motion.div
												whileHover={{ scale: 1.03 }}
												className="bg-stone-900 p-2 rounded-lg"
											>
												<Image
													src="/Payment1.png"
													alt="OZOW Form"
													width={120}
													height={80}
													className="rounded-lg border border-stone-700 mb-1"
												/>
												<p className="text-xs text-stone-400">1: Choose your Bank</p>
											</motion.div>

											<motion.div
												whileHover={{ scale: 1.03 }}
												className="bg-stone-900 p-2 rounded-lg"
											>
												<Image
													src="/Payment2.png"
													alt="Bank Selection"
													width={120}
													height={80}
													className="rounded-lg border border-stone-700 mb-1"
												/>
												<p className="text-xs text-stone-400">2: Bank Login</p>
											</motion.div>

											<motion.div
												whileHover={{ scale: 1.03 }}
												className="bg-stone-900 p-2 rounded-lg"
											>
												<Image
													src="/Payment3.png"
													alt="Bank Login"
													width={120}
													height={80}
													className="rounded-lg border border-stone-700 mb-1"
												/>
												<p className="text-xs text-stone-400">3: Select account</p>
											</motion.div>

											<motion.div
												whileHover={{ scale: 1.03 }}
												className="bg-stone-900 p-2 rounded-lg"
											>
												<Image
													src="/Payment4.png"
													alt="Confirm Payment"
													width={120}
													height={80}
													className="rounded-lg border border-stone-700 mb-1"
												/>
												<p className="text-xs text-stone-400">4: Confirm</p>
											</motion.div>
										</div>
									</div>
								</div>
							</motion.div> */}

							{/* Method 3 - Added back */}
							<motion.div
								className="bg-stone-800 rounded-lg p-5"
								variants={fadeIn}
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<div className="flex items-start gap-4">
									<div className="bg-[#fccf03] rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
										<span className="text-black font-bold text-lg">2</span>
									</div>
									<div>
										<h2 className="text-xl font-bold mb-2">EFT Payment</h2>
										<p className="text-stone-300 text-sm mb-3">
											Make a direct bank transfer to our account using these details:
										</p>

										<div className="bg-stone-900 p-3 rounded-lg text-sm text-stone-300 mb-2">
											<div className="grid grid-cols-2 gap-1">
												<span className="text-stone-400">Bank:</span>
												<span>Standard Bank</span>
												<span className="text-stone-400">Account:</span>
												<span>012345678</span>
												<span className="text-stone-400">Reference:</span>
												<span>Your loan ID</span>
											</div>
										</div>
										<p className="text-xs text-stone-400">Always include your loan ID as reference for proper allocation.</p>
									</div>
								</div>
							</motion.div>
						</motion.div>
					</motion.div>

					{/* Loan Calculator Widget - Now fixed position instead of sticky */}
					<motion.div
						className="md:w-72 hidden md:block"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5, duration: 0.8 }}
						style={{
							position: "fixed",
							right: "calc((100vw - 1280px) / 2 + 1rem)",
							top: "6rem",
							maxHeight: "calc(100vh - 12rem)",
							zIndex: 20
						}}
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

							<div className="relative h-2 bg-stone-700 rounded-full mb-2">
								<div
									className="absolute top-0 left-0 h-full bg-[#fccf03] rounded-full"
									style={{ width: `${((loanAmount - minLoan) / (maxLoan - minLoan)) * 100}%` }}
								></div>
								<div
									className="absolute top-0 w-4 h-4 bg-white rounded-full border-2 border-[#fccf03] -mt-1"
									style={{ left: `${((loanAmount - minLoan) / (maxLoan - minLoan)) * 100}%` }}
								></div>
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

					{/* Mobile Apply Button */}
					<div className="md:hidden fixed bottom-4 right-4 z-20">
						<motion.button
							className="rounded-full bg-[#fccf03] p-4 shadow-lg"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleApplyLoan}
						>
							Apply Now
						</motion.button>
					</div>
				</div>
			</div>

			<Footer />
		</motion.div>
	);
} 