import React from "react";

const AboutUsSection = () => {
	return (
		<section className="py-16 px-4 bg-gray-900">
			<div className="max-w-8xl mx-auto">
				<h2 className="text-4xl font-bold mb-8 text-center">About Us</h2>
				<div className="max-w-3xl mx-auto space-y-6 text-gray-300">
					<p className="text-lg">
						Ubuntu Lend is a service for providing loans electronically, which does not require visiting the office and providing unnecessary documents. Completing the application takes about 7 minutes.
					</p>
					<p className="text-lg">
						If the application is approved, the money will be transferred to your account or bank card. We offer our services to everyone who needs to get a loan quickly, without collateral, without lengthy registration procedures and checks.
					</p>
					<p className="text-lg">
						Loyalty is the hallmark of our Company, and we are constantly working on the attractiveness of our product. To confirm this, we constantly offer our regular Customers various promotions and loyalty programs.
					</p>
				</div>
			</div>
		</section>
	);
};

export default AboutUsSection; 