"use client";

import { motion } from "framer-motion";

const advantages = [
	{
		icon: "💵",
		title: "Complete Transparency",
		description: "Once you have accepted the loan conditions, the total cost is always visible from your personal profile"
	},
	{
		icon: "⭐",
		title: "Lender with a new approach",
		description: "We guarantee confidentiality and protection of your data"
	},
	{
		icon: "📱",
		title: "Simple and quick solution",
		description: "Our application process is quick and easy and can be completed from the comfort of your home"
	}
];

export default function AdvantagesSection() {
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
					transition={{ duration: 0.8 }}
					viewport={{ once: true }}
				>
					Ubuntu Loan advantages
				</motion.h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{advantages.map((item, index) => (
						<motion.div
							key={index}
							className="bg-gray-900 p-8 rounded-lg border border-gray-800"
							initial={{ y: 50, opacity: 0 }}
							whileInView={{ y: 0, opacity: 1 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							viewport={{ once: true }}
							whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}
						>
							<div className="text-4xl mb-6">{item.icon}</div>
							<h3 className="text-xl font-bold mb-3">{item.title}</h3>
							<p className="text-gray-400">{item.description}</p>
						</motion.div>
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
		</motion.section>
	);
} 