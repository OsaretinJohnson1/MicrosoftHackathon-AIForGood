"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
	{
		step: 1,
		title: "Create an online profile",
		description: "You can leave a request by filling out the form"
	},
	{
		step: 2,
		title: "Wait for the decision",
		description: "We make use of TruID – a secure platform that safely sends us your proof of income with your consent"
	},
	{
		step: 3,
		title: "Approval of the loan amount",
		description: "A credit limit will be granted once we have verified your details and conducted credit checks"
	},
	{
		step: 4,
		title: "Receive money",
		description: "Accept your credit offer and your loan will be deposited into your bank account"
	}
];

export default function ApplicationProcess() {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === steps.length - 3 ? 0 : prevIndex + 1
		);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? steps.length - 3 : prevIndex - 1
		);
	};

	// Auto-slide effect
	useEffect(() => {
		const interval = setInterval(() => {
			nextSlide();
		}, 5000);

		// Clean up the interval when component unmounts
		return () => clearInterval(interval);
	}, []);

	return (
		<motion.section
			className="py-16 bg-gray-900"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className="container mx-auto px-4 max-w-6xl">
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>

				<div className="relative">
					<div className="overflow-hidden">
						<motion.div
							className="flex"
							animate={{ x: `-${currentIndex * 33.33}%` }}
							transition={{ ease: "easeInOut", duration: 0.5 }}
						>
							{steps.map((item, index) => (
								<motion.div
									key={index}
									className="flex-none w-full md:w-1/3 px-4"
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									transition={{ delay: index * 0.1, duration: 0.5 }}
									viewport={{ once: true }}
								>
									<div className="bg-gray-800 p-8 rounded-lg h-full">
										<div className="w-12 h-12 bg-[#fccf03] rounded-full mb-6 flex items-center justify-center text-black font-bold">
											{item.step}
										</div>
										<h3 className="text-xl font-bold mb-3">{item.title}</h3>
										<p className="text-gray-400">{item.description}</p>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>

					<button
						className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-full -ml-4 z-10"
						onClick={prevSlide}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<button
						className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-full -mr-4 z-10"
						onClick={nextSlide}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				<div className="flex justify-center mt-8 space-x-2">
					{Array.from({ length: steps.length - 2 }).map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentIndex(index)}
							className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-[#fccf03]' : 'bg-gray-600'}`}
						/>
					))}
				</div>
			</div>
		</motion.section>
	);
} 