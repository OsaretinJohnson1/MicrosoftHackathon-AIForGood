"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Instagram, Twitter, Facebook, Linkedin, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Footer() {
	const [mounted, setMounted] = useState(false)
	const [origin, setOrigin] = useState("")
	const [dashboardUrl, setDashboardUrl] = useState("")
	const [loading, setLoading] = useState<string | null>(null)
	const router = useRouter()

	useEffect(() => {
		setMounted(true)
		// Get the origin from client-side
		const host = window.location.host
		setOrigin(host)
		// Calculate dashboard URL based on origin
		const calculatedDashboardUrl = ((host === "business.appimate.com") || host.includes("localhost"))
			? "/dashboard"
			: "https://business.appimate.com/dashboard"
		setDashboardUrl(calculatedDashboardUrl)
	}, [])

	const handleLinkClick = (href: string, label: string, isExternal: boolean) => {
		// Don't show loader for hash links (anchor links) or Contact Us
		if (href.startsWith('#') || label === "Contact Us") return;

		setLoading(label);

		if (!isExternal) {
			// For internal links, we can use the router
			setTimeout(() => {
				router.push(href);
			}, 800); // Small delay to show the animation
		} else {
			// For external links, we'll open in new tab after showing animation
			setTimeout(() => {
				window.open(href, "_blank", "noopener,noreferrer");
				setLoading(null);
			}, 800);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.15, delayChildren: 0.1 }
		}
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100, damping: 10 }
		}
	}

	const navItems = [
		{
			name: "Business Dashboard",
			href: dashboardUrl,
			isExternal: !((origin === "business.appimate.com") || origin.includes("localhost"))
		},
		{
			name: "Features",
			href: "/work",
			isExternal: false
		},
		// { name: "Services", href: "/services" },
		{
			name: "Contact Us",
			href: "/contact",
			isExternal: !((origin === "business.appimate.com") || origin.includes("localhost"))
		},
	]

	return (
		<footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="flex justify-between items-center mb-8">
					<div className="flex items-center">
						<span className="text-xl font-bold">Ubuntu</span>
						<span className="text-xl font-bold text-[#fccf03]">Lend</span>
					</div>
					<div className="flex gap-6">
						<Link href="/how-to-borrow" className="text-gray-400 hover:text-white">How to borrow</Link>
						<Link href="/how-to-postpone" className="text-gray-400 hover:text-white">How to postpone</Link>
						<Link href="/how-to-repay" className="text-gray-400 hover:text-white">How to repay</Link>
						<Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link>
						<Link href="/contact" className="text-gray-400 hover:text-white">Contact us</Link>
					</div>
					<div>
						<a href="tel:+27718685388" className="text-gray-400 hover:text-white">+27 71 868 5388</a>
					</div>
				</div>
				<div className="border-t border-gray-800 pt-8 text-center text-gray-500">
					<p>© 2025 Ubuntu Loan. All rights reserved.</p>
				</div>
			</div>
		</footer>
	)
}
