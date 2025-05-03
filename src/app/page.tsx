import Image from "next/image";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import ApplicationProcess from "@/components/ApplicationProcess";
import AdvantagesSection from "@/components/AdvantagesSection";
import LoanStepsSection from "@/components/LoanStepsSection";
import AboutUsSection from "@/components/AboutUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import PaydayLoansSection from "@/components/PaydayLoansSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Footer2 from "@/components/Footer2";

export default function Home() {
	const dashboardUrl = "https://example.com/dashboard"; // Replace with the actual URL

	return (
		<div className="bg-gray-900 text-white font-[family-name:var(--font-geist-sans)]">
			<Header isLoggedIn={false} />
			<HeroSection dashboardUrl={dashboardUrl} />
			{/* <ApplicationProcess /> */}
			<AdvantagesSection />
			<LoanStepsSection />
			<AboutUsSection />
			<TestimonialsSection />
			<FaqSection />
			<PaydayLoansSection />
			<Footer2 />
		</div>
	);
}
