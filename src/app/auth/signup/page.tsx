"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Loader2, ArrowLeft, ArrowRight, ChevronDown, CheckCircle, Check } from "lucide-react";
// import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import Tokens from 'csrf';
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

const tokens = new Tokens();
// import NavBar from "@/components/nav-bar";

// Country codes array with dial codes
interface CountryCode {
	code: string;
	name: string;
	dial_code: string;
}

// Country codes array with dial codes
const countryCodes: CountryCode[] = [
	{ code: "AF", name: "Afghanistan", dial_code: "+93" },
	{ code: "AL", name: "Albania", dial_code: "+355" },
	{ code: "DZ", name: "Algeria", dial_code: "+213" },
	{ code: "AS", name: "American Samoa", dial_code: "+1684" },
	{ code: "AD", name: "Andorra", dial_code: "+376" },
	{ code: "AO", name: "Angola", dial_code: "+244" },
	{ code: "AI", name: "Anguilla", dial_code: "+1264" },
	{ code: "AQ", name: "Antarctica", dial_code: "+672" },
	{ code: "AG", name: "Antigua and Barbuda", dial_code: "+1268" },
	{ code: "AR", name: "Argentina", dial_code: "+54" },
	{ code: "AM", name: "Armenia", dial_code: "+374" },
	{ code: "AW", name: "Aruba", dial_code: "+297" },
	{ code: "AU", name: "Australia", dial_code: "+61" },
	{ code: "AT", name: "Austria", dial_code: "+43" },
	{ code: "AZ", name: "Azerbaijan", dial_code: "+994" },
	{ code: "BS", name: "Bahamas", dial_code: "+1242" },
	{ code: "BH", name: "Bahrain", dial_code: "+973" },
	{ code: "BD", name: "Bangladesh", dial_code: "+880" },
	{ code: "BB", name: "Barbados", dial_code: "+1246" },
	{ code: "BY", name: "Belarus", dial_code: "+375" },
	{ code: "BE", name: "Belgium", dial_code: "+32" },
	{ code: "BZ", name: "Belize", dial_code: "+501" },
	{ code: "BJ", name: "Benin", dial_code: "+229" },
	{ code: "BM", name: "Bermuda", dial_code: "+1441" },
	{ code: "BT", name: "Bhutan", dial_code: "+975" },
	{ code: "BO", name: "Bolivia", dial_code: "+591" },
	{ code: "BA", name: "Bosnia and Herzegovina", dial_code: "+387" },
	{ code: "BW", name: "Botswana", dial_code: "+267" },
	{ code: "BR", name: "Brazil", dial_code: "+55" },
	{ code: "IO", name: "British Indian Ocean Territory", dial_code: "+246" },
	{ code: "BN", name: "Brunei Darussalam", dial_code: "+673" },
	{ code: "BG", name: "Bulgaria", dial_code: "+359" },
	{ code: "BF", name: "Burkina Faso", dial_code: "+226" },
	{ code: "BI", name: "Burundi", dial_code: "+257" },
	{ code: "KH", name: "Cambodia", dial_code: "+855" },
	{ code: "CM", name: "Cameroon", dial_code: "+237" },
	{ code: "CA", name: "Canada", dial_code: "+1" },
	{ code: "CV", name: "Cape Verde", dial_code: "+238" },
	{ code: "KY", name: "Cayman Islands", dial_code: "+1345" },
	{ code: "CF", name: "Central African Republic", dial_code: "+236" },
	{ code: "TD", name: "Chad", dial_code: "+235" },
	{ code: "CL", name: "Chile", dial_code: "+56" },
	{ code: "CN", name: "China", dial_code: "+86" },
	{ code: "CX", name: "Christmas Island", dial_code: "+61" },
	{ code: "CC", name: "Cocos (Keeling) Islands", dial_code: "+61" },
	{ code: "CO", name: "Colombia", dial_code: "+57" },
	{ code: "KM", name: "Comoros", dial_code: "+269" },
	{ code: "CG", name: "Congo", dial_code: "+242" },
	{ code: "CD", name: "Congo, Democratic Republic", dial_code: "+243" },
	{ code: "CK", name: "Cook Islands", dial_code: "+682" },
	{ code: "CR", name: "Costa Rica", dial_code: "+506" },
	{ code: "CI", name: "Cote d'Ivoire", dial_code: "+225" },
	{ code: "HR", name: "Croatia", dial_code: "+385" },
	{ code: "CU", name: "Cuba", dial_code: "+53" },
	{ code: "CY", name: "Cyprus", dial_code: "+357" },
	{ code: "CZ", name: "Czech Republic", dial_code: "+420" },
	{ code: "DK", name: "Denmark", dial_code: "+45" },
	{ code: "DJ", name: "Djibouti", dial_code: "+253" },
	{ code: "DM", name: "Dominica", dial_code: "+1767" },
	{ code: "DO", name: "Dominican Republic", dial_code: "+1849" },
	{ code: "EC", name: "Ecuador", dial_code: "+593" },
	{ code: "EG", name: "Egypt", dial_code: "+20" },
	{ code: "SV", name: "El Salvador", dial_code: "+503" },
	{ code: "GQ", name: "Equatorial Guinea", dial_code: "+240" },
	{ code: "ER", name: "Eritrea", dial_code: "+291" },
	{ code: "EE", name: "Estonia", dial_code: "+372" },
	{ code: "ET", name: "Ethiopia", dial_code: "+251" },
	{ code: "FK", name: "Falkland Islands", dial_code: "+500" },
	{ code: "FO", name: "Faroe Islands", dial_code: "+298" },
	{ code: "FJ", name: "Fiji", dial_code: "+679" },
	{ code: "FI", name: "Finland", dial_code: "+358" },
	{ code: "FR", name: "France", dial_code: "+33" },
	{ code: "GF", name: "French Guiana", dial_code: "+594" },
	{ code: "PF", name: "French Polynesia", dial_code: "+689" },
	{ code: "GA", name: "Gabon", dial_code: "+241" },
	{ code: "GM", name: "Gambia", dial_code: "+220" },
	{ code: "GE", name: "Georgia", dial_code: "+995" },
	{ code: "DE", name: "Germany", dial_code: "+49" },
	{ code: "GH", name: "Ghana", dial_code: "+233" },
	{ code: "GI", name: "Gibraltar", dial_code: "+350" },
	{ code: "GR", name: "Greece", dial_code: "+30" },
	{ code: "GL", name: "Greenland", dial_code: "+299" },
	{ code: "GD", name: "Grenada", dial_code: "+1473" },
	{ code: "GP", name: "Guadeloupe", dial_code: "+590" },
	{ code: "GU", name: "Guam", dial_code: "+1671" },
	{ code: "GT", name: "Guatemala", dial_code: "+502" },
	{ code: "GG", name: "Guernsey", dial_code: "+44" },
	{ code: "GN", name: "Guinea", dial_code: "+224" },
	{ code: "GW", name: "Guinea-Bissau", dial_code: "+245" },
	{ code: "GY", name: "Guyana", dial_code: "+592" },
	{ code: "HT", name: "Haiti", dial_code: "+509" },
	{ code: "VA", name: "Holy See (Vatican City)", dial_code: "+379" },
	{ code: "HN", name: "Honduras", dial_code: "+504" },
	{ code: "HK", name: "Hong Kong", dial_code: "+852" },
	{ code: "HU", name: "Hungary", dial_code: "+36" },
	{ code: "IS", name: "Iceland", dial_code: "+354" },
	{ code: "IN", name: "India", dial_code: "+91" },
	{ code: "ID", name: "Indonesia", dial_code: "+62" },
	{ code: "IR", name: "Iran", dial_code: "+98" },
	{ code: "IQ", name: "Iraq", dial_code: "+964" },
	{ code: "IE", name: "Ireland", dial_code: "+353" },
	{ code: "IM", name: "Isle of Man", dial_code: "+44" },
	{ code: "IL", name: "Israel", dial_code: "+972" },
	{ code: "IT", name: "Italy", dial_code: "+39" },
	{ code: "JM", name: "Jamaica", dial_code: "+1876" },
	{ code: "JP", name: "Japan", dial_code: "+81" },
	{ code: "JE", name: "Jersey", dial_code: "+44" },
	{ code: "JO", name: "Jordan", dial_code: "+962" },
	{ code: "KZ", name: "Kazakhstan", dial_code: "+7" },
	{ code: "KE", name: "Kenya", dial_code: "+254" },
	{ code: "KI", name: "Kiribati", dial_code: "+686" },
	{ code: "KP", name: "Korea, North", dial_code: "+850" },
	{ code: "KR", name: "Korea, South", dial_code: "+82" },
	{ code: "KW", name: "Kuwait", dial_code: "+965" },
	{ code: "KG", name: "Kyrgyzstan", dial_code: "+996" },
	{ code: "LA", name: "Laos", dial_code: "+856" },
	{ code: "LV", name: "Latvia", dial_code: "+371" },
	{ code: "LB", name: "Lebanon", dial_code: "+961" },
	{ code: "LS", name: "Lesotho", dial_code: "+266" },
	{ code: "LR", name: "Liberia", dial_code: "+231" },
	{ code: "LY", name: "Libya", dial_code: "+218" },
	{ code: "LI", name: "Liechtenstein", dial_code: "+423" },
	{ code: "LT", name: "Lithuania", dial_code: "+370" },
	{ code: "LU", name: "Luxembourg", dial_code: "+352" },
	{ code: "MO", name: "Macao", dial_code: "+853" },
	{ code: "MK", name: "Macedonia", dial_code: "+389" },
	{ code: "MG", name: "Madagascar", dial_code: "+261" },
	{ code: "MW", name: "Malawi", dial_code: "+265" },
	{ code: "MY", name: "Malaysia", dial_code: "+60" },
	{ code: "MV", name: "Maldives", dial_code: "+960" },
	{ code: "ML", name: "Mali", dial_code: "+223" },
	{ code: "MT", name: "Malta", dial_code: "+356" },
	{ code: "MH", name: "Marshall Islands", dial_code: "+692" },
	{ code: "MQ", name: "Martinique", dial_code: "+596" },
	{ code: "MR", name: "Mauritania", dial_code: "+222" },
	{ code: "MU", name: "Mauritius", dial_code: "+230" },
	{ code: "YT", name: "Mayotte", dial_code: "+262" },
	{ code: "MX", name: "Mexico", dial_code: "+52" },
	{ code: "FM", name: "Micronesia", dial_code: "+691" },
	{ code: "MD", name: "Moldova", dial_code: "+373" },
	{ code: "MC", name: "Monaco", dial_code: "+377" },
	{ code: "MN", name: "Mongolia", dial_code: "+976" },
	{ code: "ME", name: "Montenegro", dial_code: "+382" },
	{ code: "MS", name: "Montserrat", dial_code: "+1664" },
	{ code: "MA", name: "Morocco", dial_code: "+212" },
	{ code: "MZ", name: "Mozambique", dial_code: "+258" },
	{ code: "MM", name: "Myanmar", dial_code: "+95" },
	{ code: "NA", name: "Namibia", dial_code: "+264" },
	{ code: "NR", name: "Nauru", dial_code: "+674" },
	{ code: "NP", name: "Nepal", dial_code: "+977" },
	{ code: "NL", name: "Netherlands", dial_code: "+31" },
	{ code: "NC", name: "New Caledonia", dial_code: "+687" },
	{ code: "NZ", name: "New Zealand", dial_code: "+64" },
	{ code: "NI", name: "Nicaragua", dial_code: "+505" },
	{ code: "NE", name: "Niger", dial_code: "+227" },
	{ code: "NG", name: "Nigeria", dial_code: "+234" },
	{ code: "NU", name: "Niue", dial_code: "+683" },
	{ code: "NF", name: "Norfolk Island", dial_code: "+672" },
	{ code: "MP", name: "Northern Mariana Islands", dial_code: "+1670" },
	{ code: "NO", name: "Norway", dial_code: "+47" },
	{ code: "OM", name: "Oman", dial_code: "+968" },
	{ code: "PK", name: "Pakistan", dial_code: "+92" },
	{ code: "PW", name: "Palau", dial_code: "+680" },
	{ code: "PS", name: "Palestine", dial_code: "+970" },
	{ code: "PA", name: "Panama", dial_code: "+507" },
	{ code: "PG", name: "Papua New Guinea", dial_code: "+675" },
	{ code: "PY", name: "Paraguay", dial_code: "+595" },
	{ code: "PE", name: "Peru", dial_code: "+51" },
	{ code: "PH", name: "Philippines", dial_code: "+63" },
	{ code: "PN", name: "Pitcairn", dial_code: "+64" },
	{ code: "PL", name: "Poland", dial_code: "+48" },
	{ code: "PT", name: "Portugal", dial_code: "+351" },
	{ code: "PR", name: "Puerto Rico", dial_code: "+1939" },
	{ code: "QA", name: "Qatar", dial_code: "+974" },
	{ code: "RE", name: "Reunion", dial_code: "+262" },
	{ code: "RO", name: "Romania", dial_code: "+40" },
	{ code: "RU", name: "Russia", dial_code: "+7" },
	{ code: "RW", name: "Rwanda", dial_code: "+250" },
	{ code: "BL", name: "Saint Barthelemy", dial_code: "+590" },
	{ code: "SH", name: "Saint Helena", dial_code: "+290" },
	{ code: "KN", name: "Saint Kitts and Nevis", dial_code: "+1869" },
	{ code: "LC", name: "Saint Lucia", dial_code: "+1758" },
	{ code: "MF", name: "Saint Martin", dial_code: "+590" },
	{ code: "PM", name: "Saint Pierre and Miquelon", dial_code: "+508" },
	{ code: "VC", name: "Saint Vincent and Grenadines", dial_code: "+1784" },
	{ code: "WS", name: "Samoa", dial_code: "+685" },
	{ code: "SM", name: "San Marino", dial_code: "+378" },
	{ code: "ST", name: "Sao Tome and Principe", dial_code: "+239" },
	{ code: "SA", name: "Saudi Arabia", dial_code: "+966" },
	{ code: "SN", name: "Senegal", dial_code: "+221" },
	{ code: "RS", name: "Serbia", dial_code: "+381" },
	{ code: "SC", name: "Seychelles", dial_code: "+248" },
	{ code: "SL", name: "Sierra Leone", dial_code: "+232" },
	{ code: "SG", name: "Singapore", dial_code: "+65" },
	{ code: "SK", name: "Slovakia", dial_code: "+421" },
	{ code: "SI", name: "Slovenia", dial_code: "+386" },
	{ code: "SB", name: "Solomon Islands", dial_code: "+677" },
	{ code: "SO", name: "Somalia", dial_code: "+252" },
	{ code: "ZA", name: "South Africa", dial_code: "+27" },
	{ code: "SS", name: "South Sudan", dial_code: "+211" },
	{ code: "ES", name: "Spain", dial_code: "+34" },
	{ code: "LK", name: "Sri Lanka", dial_code: "+94" },
	{ code: "SD", name: "Sudan", dial_code: "+249" },
	{ code: "SR", name: "Suriname", dial_code: "+597" },
	{ code: "SJ", name: "Svalbard and Jan Mayen", dial_code: "+47" },
	{ code: "SZ", name: "Swaziland", dial_code: "+268" },
	{ code: "SE", name: "Sweden", dial_code: "+46" },
	{ code: "CH", name: "Switzerland", dial_code: "+41" },
	{ code: "SY", name: "Syria", dial_code: "+963" },
	{ code: "TW", name: "Taiwan", dial_code: "+886" },
	{ code: "TJ", name: "Tajikistan", dial_code: "+992" },
	{ code: "TZ", name: "Tanzania", dial_code: "+255" },
	{ code: "TH", name: "Thailand", dial_code: "+66" },
	{ code: "TL", name: "Timor-Leste", dial_code: "+670" },
	{ code: "TG", name: "Togo", dial_code: "+228" },
	{ code: "TK", name: "Tokelau", dial_code: "+690" },
	{ code: "TO", name: "Tonga", dial_code: "+676" },
	{ code: "TT", name: "Trinidad and Tobago", dial_code: "+1868" },
	{ code: "TN", name: "Tunisia", dial_code: "+216" },
	{ code: "TR", name: "Turkey", dial_code: "+90" },
	{ code: "TM", name: "Turkmenistan", dial_code: "+993" },
	{ code: "TC", name: "Turks and Caicos Islands", dial_code: "+1649" },
	{ code: "TV", name: "Tuvalu", dial_code: "+688" },
	{ code: "UG", name: "Uganda", dial_code: "+256" },
	{ code: "UA", name: "Ukraine", dial_code: "+380" },
	{ code: "AE", name: "United Arab Emirates", dial_code: "+971" },
	{ code: "GB", name: "United Kingdom", dial_code: "+44" },
	{ code: "US", name: "United States", dial_code: "+1" },
	{ code: "UY", name: "Uruguay", dial_code: "+598" },
	{ code: "UZ", name: "Uzbekistan", dial_code: "+998" },
	{ code: "VU", name: "Vanuatu", dial_code: "+678" },
	{ code: "VE", name: "Venezuela", dial_code: "+58" },
	{ code: "VN", name: "Vietnam", dial_code: "+84" },
	{ code: "VG", name: "Virgin Islands, British", dial_code: "+1284" },
	{ code: "VI", name: "Virgin Islands, U.S.", dial_code: "+1340" },
	{ code: "WF", name: "Wallis and Futuna", dial_code: "+681" },
	{ code: "YE", name: "Yemen", dial_code: "+967" },
	{ code: "ZM", name: "Zambia", dial_code: "+260" },
	{ code: "ZW", name: "Zimbabwe", dial_code: "+263" }
];

interface FormErrors {
	email?: string;
	firstname?: string;
	lastname?: string;
	countryCode?: string;
	phone?: string;
	idNumber?: string;
	workAddress?: string;
	employer?: string;
	accountNumber?: string;
	accountName?: string;
	accountType?: string;
	payDate?: string;
	general?: string;
	otp?: string;
	employmentType?: string;
	bankName?: string;
	loanAmount?: string;
	loanTermMonths?: string;
	purpose?: string;
	loanTypeId?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	ageGroup?: string;
	occupation?: string;
	incomeLevel?: string;
}

interface ValidationState {
	email: boolean;
	firstname: boolean;
	lastname: boolean;
	countryCode: boolean;
	phone: boolean;
	idNumber: boolean;
	workAddress: boolean;
	employer: boolean;
	accountNumber: boolean;
	accountName: boolean;
	accountType: boolean;
	payDate: boolean;
	employmentType: boolean;
	bankName: boolean;
	loanAmount: boolean;
	loanTermMonths: boolean;
	purpose: boolean;
	loanTypeId: boolean;
	address: boolean;
	city: boolean;
	postalCode: boolean;
	ageGroup: boolean;
	occupation: boolean;
	incomeLevel: boolean;
}

interface ApiResponse {
	errors?: {
		email?: string;
		firstname?: string;
		lastname?: string;
		phone?: string;
		general?: string;
	};
	error?: string;
	message?: string;
	userId?: string;
	success?: boolean;
	name?: string;
}

interface LoadingState {
	submit: boolean;
	verify: boolean;
}

export default function LoanApplicationPage() {
	// Form fields
	const [formData, setFormData] = useState({
		// Personal information
		firstname: "",
		lastname: "",
		email: "",
		countryCode: "+27",  // Default country code for South Africa
		phone: "",
		idNumber: "",
		
		// Address information
		address: "",
		city: "",
		postalCode: "",
		
		// Demographic information		ageGroup: "",
		occupation: "",
		incomeLevel: "",

		// Employment details
		workAddress: "",
		employer: "",
		employmentType: "", // Added to match schema

		// Banking details
		accountNumber: "",
		accountName: "",
		accountType: "",
		bankName: "", // Added to match schema
		payDate: "",

		// Loan details
		loanAmount: "", // Default amount
		loanTermMonths: "", // Default term
		purpose: "", // Default purpose
		loanTypeId: "", // Default to Personal Loan
		ageGroup: "",
	});

	const [currentStep, setCurrentStep] = useState(1);
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<ValidationState>({
		email: false,
		firstname: false,
		lastname: false,
		countryCode: false,
		phone: false,
		idNumber: false,
		workAddress: false,
		employer: false,
		accountNumber: false,
		accountName: false,
		accountType: false,
		payDate: false,
		employmentType: false,
		bankName: false,
		loanAmount: false,
		loanTermMonths: false,
		purpose: false,
		loanTypeId: false,
		address: false,
		city: false,
		postalCode: false,
		ageGroup: false,
		occupation: false,
		incomeLevel: false,
	});
	const [loading, setLoading] = useState<LoadingState>({
		submit: false,
		verify: false
	});
	const [showCountryList, setShowCountryList] = useState(false);
	const [countrySearch, setCountrySearch] = useState("");
	const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
	const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
	const [csrfSecret, setCsrfSecret] = useState<string | null>(null);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);
	const [verificationStep, setVerificationStep] = useState<'registration' | 'otp' | 'success'>('registration');
	const [otp, setOtp] = useState("");
	const [registeredUser, setRegisteredUser] = useState<any>(null);
	const router = useRouter();

	const totalSteps = 5;

	// Filter countries based on search term
	const filteredCountries = countrySearch
		? countryCodes.filter(country =>
			country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
			country.dial_code.includes(countrySearch))
		: countryCodes;

	// Close country dropdown when clicking outside
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			if (showCountryList) {
				const target = e.target as HTMLElement;
				if (!target.closest('.country-selector')) {
					setShowCountryList(false);
				}
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [showCountryList]);

	useEffect(() => {
		// Generate CSRF secret and token
		const secret = tokens.secretSync();
		const token = tokens.create(secret);
		setCsrfSecret(secret);
		setCsrfToken(token);

		// Store secret in cookie
		document.cookie = `csrf-secret=${secret}; path=/; SameSite=Strict`;

		// Load reCAPTCHA script
		const script = document.createElement('script');
		script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
		script.addEventListener('load', () => {
			// Verify the site key is valid
			if (!(window as any).grecaptcha) {
				setRecaptchaError("reCAPTCHA failed to load - invalid site key");
				setRecaptchaLoaded(false);
				return;
			}

			(window as any).grecaptcha.ready(() => {
				try {
					// Test execute to verify site key
					(window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
						.then(() => {
							setRecaptchaLoaded(true);
							setRecaptchaError(null);
						})
						.catch(() => {
							setRecaptchaError("Invalid reCAPTCHA site key");
							setRecaptchaLoaded(false);
						});
				} catch (err) {
					setRecaptchaError("Invalid reCAPTCHA site key");
					setRecaptchaLoaded(false);
				}
			});
		});

		script.addEventListener('error', () => {
			setRecaptchaError("Failed to load reCAPTCHA");
			setRecaptchaLoaded(false);
		});

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	// Handle input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		let processedValue = value;

		// Special handling for phone numbers - remove non-numeric characters
		if (name === 'phone' || name === 'accountNumber') {
			processedValue = value.replace(/[^0-9]/g, '');
		}

		setFormData({
			...formData,
			[name]: processedValue
		});

		// Clear errors when the user starts typing
		if (errors[name as keyof FormErrors]) {
			setErrors({
				...errors,
				[name]: undefined,
				general: undefined
			});
		}
	};

	// Validation functions
	const validateField = (name: string, value: string): string | undefined => {
		switch (name) {
			case 'email':
				if (!value) return "Email is required";
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) return "Please enter a valid email address";
				break;
			case 'firstname':
			case 'lastname':
			case 'employer':
			case 'accountName':
				if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
				break;
			case 'countryCode':
				if (!value) return "Country code is required";
				const countryCodeRegex = /^\+[1-9]\d{0,2}$/;
				if (!countryCodeRegex.test(value)) return "Please enter a valid country code (e.g. +27)";
				break;
			case 'phone':
				if (!value) return "Phone number is required";
				const phoneRegex = /^[0-9]\d{7,14}$/;
				if (!phoneRegex.test(value)) return "Please enter a valid phone number";
				break;
			case 'idNumber':
				if (!value) return "ID number is required";
				if (value.length !== 13) return "ID number must be 13 digits";
				break;
			case 'accountNumber':
				if (!value) return "Account number is required";
				break;
			case 'accountType':
				if (!value) return "Account type is required";
				break;
			case 'payDate':
				if (!value) return "Pay date is required";
				break;
			case 'employmentType':
				if (!value) return "Employment type is required";
				break;
			case 'bankName':
				if (!value) return "Bank name is required";
				break;
			case 'loanAmount':
				if (!value) return "Loan amount is required";
				const amount = Number(value);
				if (isNaN(amount) || amount < 1000) return "Loan amount must be at least 1,000";
				if (amount > 50000) return "Loan amount cannot exceed 50,000";
				break;
			case 'loanTermMonths':
				if (!value) return "Loan term is required";
				const term = Number(value);
				if (isNaN(term) || term < 1) return "Loan term must be at least 1 month";
				if (term > 60) return "Loan term cannot exceed 60 months";
				break;
			case 'purpose':
				if (!value) return "Loan purpose is required";
				break;
			case 'loanTypeId':
				if (!value) return "Loan type is required";
				break;
			case 'address':
				if (!value) return "Address is required";
				break;
			case 'city':
				if (!value) return "City is required";
				break;
			case 'postalCode':
				if (!value) return "Postal code is required";
				break;
			case 'ageGroup':
				if (!value) return "Age group is required";
				break;
			case 'occupation':
				if (!value) return "Occupation is required";
				break;
			case 'incomeLevel':
				if (!value) return "Income level is required";
				break;
		}
	};

	const handleBlur = (fieldName: keyof ValidationState) => {
		setTouched(prev => ({ ...prev, [fieldName]: true }));

		const fieldValue = formData[fieldName as keyof typeof formData];
		const fieldError = validateField(fieldName, fieldValue as string);

		setErrors(prev => ({
			...prev,
			[fieldName]: fieldError,
			general: undefined
		}));
	};

	const validateStep = (step: number): boolean => {
		const newErrors: FormErrors = {};
		let isValid = true;

		// Define which fields to validate based on current step
		let fieldsToValidate: (keyof ValidationState)[] = [];

		switch (step) {
			case 1:
				fieldsToValidate = ['firstname', 'lastname', 'email', 'countryCode', 'phone', 'idNumber'];
				break;
			case 2:
				fieldsToValidate = ['address', 'city', 'postalCode', 'ageGroup', 'incomeLevel'];
				break;
			case 3:
				fieldsToValidate = ['employer', 'workAddress', 'employmentType', 'occupation'];
				break;
			case 4:
				fieldsToValidate = ['accountNumber', 'accountName', 'accountType', 'bankName', 'payDate'];
				break;
			case 5:
				fieldsToValidate = ['loanAmount', 'loanTermMonths', 'purpose', 'loanTypeId'];
				break;
		}

		// Mark fields as touched and validate them
		const newTouched = { ...touched };

		fieldsToValidate.forEach(field => {
			newTouched[field] = true;
			const value = formData[field as keyof typeof formData] as string;
			const error = validateField(field, value);

			if (error) {
				newErrors[field] = error;
				isValid = false;
			}
		});

		setTouched(newTouched);
		setErrors(prev => ({ ...prev, ...newErrors }));

		return isValid;
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(prevStep => Math.min(prevStep + 1, totalSteps));
		}
	};

	const handlePrevious = () => {
		setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
	};

	// Handle OTP input change
	const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newOtp = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
		setOtp(newOtp);
		if (errors.otp) {
			setErrors({
				...errors,
				otp: undefined,
				general: undefined
			});
		}
	};

	// Validate OTP
	const validateOtp = (otp: string): string | undefined => {
		if (!otp) {
			return "Verification code is required";
		}
		const otpRegex = /^[0-9]{6}$/;
		if (!otpRegex.test(otp)) {
			return "Please enter a valid 6-digit verification code";
		}
		return undefined;
	};

	// Format phone number for better readability
	const formatPhoneNumber = (phone: string, code: string): string => {
		// Remove any non-numeric characters from the phone
		const cleanedPhone = phone.startsWith('0') ? phone.substring(1) : phone;
		// Combine country code and phone
		return `${code}${cleanedPhone}`;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// If we're in OTP verification step
		if (verificationStep === 'otp') {
			await verifyOtp();
			return;
		}

		// We're in registration step
		// Validate the final step before submission
		if (!validateStep(currentStep)) {
			return;
		}

		// Verify CSRF token matches secret
		if (!csrfToken || !csrfSecret || !tokens.verify(csrfSecret, csrfToken)) {
			setErrors({ general: "Invalid security token. Please refresh the page." });
			return;
		}

		if (!recaptchaLoaded || recaptchaError) {
			setErrors({ general: recaptchaError || "reCAPTCHA verification required" });
			return;
		}

		setLoading(prev => ({ ...prev, submit: true }));
		setErrors({});

		try {
			// Check if reCAPTCHA is loaded
			if (!recaptchaLoaded || !(window as any).grecaptcha?.execute) {
				throw new Error('reCAPTCHA has not loaded properly. Please refresh the page and try again.');
			}

			// Execute reCAPTCHA v3
			const recaptchaToken = await (window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' });

			if (!recaptchaToken) {
				setErrors({ general: 'reCAPTCHA verification failed' });
				return;
			}

			// Clean phone number by removing leading zero if present
			const cleanedPhone = formData.phone.startsWith('0') ? formData.phone.substring(1) : formData.phone;

			// Send application and create user account
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfToken,
				},
				body: JSON.stringify({
					...formData,
					phone: cleanedPhone, // Use cleaned phone number format
					recaptchaToken,
					csrfToken,
					isLoanApplication: true, // Flag to indicate this is a loan application
					loanAmount: parseFloat(formData.loanAmount), // Convert to number
					loanTermMonths: parseInt(formData.loanTermMonths), // Convert to number
					loanTypeId: parseInt(formData.loanTypeId), // Convert to number
				}),
			});

			const data: ApiResponse = await response.json();

			if (!response.ok) {
				// Handle API errors
				if (data.errors) {
					// Set specific field errors from backend
					setErrors(data.errors);
					
					// Identify which fields have errors
					const fieldKeys = Object.keys(data.errors) as (keyof FormErrors)[];
					
					// Mark fields with errors as touched so errors display immediately
					const newTouched = { ...touched };
					fieldKeys.forEach(field => {
						if (field in newTouched) {
							newTouched[field as keyof ValidationState] = true;
						}
					});
					setTouched(newTouched);
					
					// Create a mapping of fields to their corresponding steps
					const fieldToStepMapping: Record<string, number> = {
						// Step 1 fields
						firstname: 1,
						lastname: 1,
						email: 1,
						countryCode: 1,
						phone: 1,
						idNumber: 1,
						
						// Step 2 fields
						address: 2,
						city: 2,
						postalCode: 2,
						ageGroup: 2,
						incomeLevel: 2,
						
						// Step 3 fields
						employer: 3,
						workAddress: 3,
						employmentType: 3,
						occupation: 3,
						
						// Step 4 fields
						accountNumber: 4,
						accountName: 4,
						accountType: 4,
						bankName: 4,
						payDate: 4,
						
						// Step 5 fields
						loanAmount: 5,
						loanTermMonths: 5,
						purpose: 5,
						loanTypeId: 5
					};
					
					// Find the earliest step that has an error
					let earliestErrorStep = totalSteps + 1;
					
					fieldKeys.forEach(field => {
						if (field !== 'general' && fieldToStepMapping[field] && fieldToStepMapping[field] < earliestErrorStep) {
							earliestErrorStep = fieldToStepMapping[field];
						}
					});
					
					// Navigate to the earliest step with an error
					if (earliestErrorStep <= totalSteps) {
						setCurrentStep(earliestErrorStep);
					}
					
					// Set general error message if not already set
					if (!data.errors.general) {
						setErrors(prev => ({
							...prev,
							general: "Please correct the highlighted errors and try again."
						}));
					}
				} else if (data.error) {
					// Handle general error message
					setErrors({ general: data.error });
				} else {
					throw new Error('Application submission failed. Please try again.');
				}
				return;
			}

			// Registration successful - store user info
			setRegisteredUser({
				userId: data.userId,
				name: data.name || `${formData.firstname} ${formData.lastname}`,
				phone: cleanedPhone, // Store cleaned phone
				countryCode: formData.countryCode
			});

			// Wait a moment before sending OTP to ensure user is properly registered in database
			setTimeout(async () => {
				// Now send OTP to the registered phone
				await sendOtp();
			}, 1000);

		} catch (error: any) {
			console.error('Application Submission Error:', error);
			setErrors({ general: error.message || 'Failed to submit application. Please try again.' });
		} finally {
			setLoading(prev => ({ ...prev, submit: false }));
		}
	};

	// Send OTP to the phone
	const sendOtp = async () => {
		try {
			setLoading(prev => ({ ...prev, submit: true }));

			// Get reCAPTCHA token
			const recaptchaToken = await (window as any).grecaptcha.execute(
				process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
				{ action: 'login' }
			);

			// Clean phone number by removing leading zero if present
			const cleanedPhone = formData.phone.startsWith('0') ? formData.phone.substring(1) : formData.phone;

			console.log("Sending OTP for:", {
				countryCode: formData.countryCode,
				cleanedPhone: cleanedPhone,
				fullPhone: `${formData.countryCode}${cleanedPhone}`
			});

			// Use the login API endpoint to send OTP
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					countryCode: formData.countryCode,
					cellPhone: cleanedPhone,
					recaptchaToken
				}),
			});

			const data = await response.json();
			console.log("OTP API response:", data);

			if (!response.ok) {
				console.error('Send OTP API error:', data);
				throw new Error(data.error || 'Failed to send verification code');
			}

			// If in development mode and OTP is returned, show it for testing
			if (process.env.NODE_ENV === 'development' && data.otp) {
				alert(`For development: Your OTP is ${data.otp}`);
			}

			// Change to OTP verification step
			setVerificationStep('otp');

		} catch (error: any) {
			console.error('Send OTP error:', error);
			setErrors({ general: error.message || 'Failed to send verification code' });
		} finally {
			setLoading(prev => ({ ...prev, submit: false }));
		}
	};

	// Verify OTP
	const verifyOtp = async () => {
		try {
			// Validate OTP
			const otpError = validateOtp(otp);
			if (otpError) {
				setErrors({ otp: otpError });
				return;
			}

			setLoading(prev => ({ ...prev, verify: true }));
			setErrors({}); // Clear any previous errors

			// Get reCAPTCHA token
			const recaptchaToken = await (window as any).grecaptcha.execute(
				process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
				{ action: 'verify' }
			);

			// Clean phone number by removing leading zero if present
			const cleanedPhone = formData.phone.startsWith('0') ? formData.phone.substring(1) : formData.phone;

			console.log("Verifying OTP with API for:", {
				countryCode: formData.countryCode,
				cellPhone: cleanedPhone,
				otp: otp,
				fullPhone: `${formData.countryCode}${cleanedPhone}`
			});

			// Verify OTP via the API - using the correct endpoint
			const response = await fetch('/api/auth/verify-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					countryCode: formData.countryCode,
					cellPhone: cleanedPhone,
					otp,
					recaptchaToken
				}),
			});

			const data = await response.json();
			console.log("Verification API response:", data);

			if (!response.ok) {
				console.error('Verify OTP API error:', data);

				if (data.errors) {
					setErrors(data.errors);
				} else if (data.error) {
					setErrors({ general: data.error });
				} else {
					throw new Error('OTP verification failed - Unknown error');
				}
				return;
			}

			// If verification was successful, show success animation first
			setVerificationStep('success');

			// Verification successful - now sign in the user using NextAuth
			console.log("Calling NextAuth signIn with credentials:", {
				countryCode: formData.countryCode,
				cellPhone: cleanedPhone,
				mode: 'verify'
			});

			// Then call NextAuth's signIn to create a proper session
			try {
				// Immediately check admin status for the proper redirection
				const response = await fetch('/api/auth/session');
				const sessionData = await response.json();
				
				// Determine redirect URL based on admin status
				const isAdmin = sessionData?.user?.isAdmin === 1 || sessionData?.user?.userStatus === 1;
				const redirectUrl = isAdmin ? '/dashboard' : '/user-app';
				console.log("Admin status:", isAdmin, "Preparing redirect to:", redirectUrl);

				const signInResult = await signIn('credentials', {
					countryCode: formData.countryCode,
					cellPhone: cleanedPhone,
					mode: 'verify',
					preVerified: 'true', // Indicate that we already verified OTP
					redirect: false,
					callbackUrl: redirectUrl // Set the correct redirect URL from the start
				});

				console.log("NextAuth signIn result:", signInResult);

				if (signInResult?.error) {
					console.error('NextAuth signIn error:', signInResult.error);
					throw new Error(`Failed to create session: ${signInResult.error}`);
				}

				// Wait a moment to show the success animation before redirecting
				setTimeout(() => {
					router.push(redirectUrl);
				}, 1000); // Reduced delay for faster response
			} catch (signInError) {
				console.error('SignIn error:', signInError);
				throw new Error('Failed to create session. Please try again.');
			}

		} catch (error: any) {
			console.error('OTP Verification Error:', error);
			if (!Object.keys(errors).length) {
				setErrors({ general: error.message || 'Failed to verify OTP' });
			}
			// If we were already showing success, go back to OTP step on error
			if (verificationStep === 'success') {
				setVerificationStep('otp');
			}
		} finally {
			setLoading(prev => ({ ...prev, verify: false }));
		}
	};

	// Handle resend OTP
	const handleResendOTP = async () => {
		try {
			setLoading(prev => ({ ...prev, submit: true }));

			// Get reCAPTCHA token
			const recaptchaToken = await (window as any).grecaptcha.execute(
				process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
				{ action: 'login' }
			);

			// Use the login API endpoint to resend OTP
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					countryCode: formData.countryCode,
					cellPhone: formData.phone,
					recaptchaToken,
					resend: true
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error('Resend OTP API error:', data);
				throw new Error(data.error || 'Failed to resend verification code');
			}

			// If in development mode and OTP is returned, show it for testing
			if (process.env.NODE_ENV === 'development' && data.otp) {
				alert(`For development: Your new OTP is ${data.otp}`);
			} else {
				alert("Verification code resent successfully!");
			}

		} catch (error: any) {
			console.error('Resend OTP error:', error);
			alert(error.message || 'Failed to resend verification code');
		} finally {
			setLoading(prev => ({ ...prev, submit: false }));
		}
	};

	// Style changes for input fields to match login page
	const getInputClassName = (fieldName: keyof ValidationState) => {
		const baseClasses = "mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-[#fccf03] focus:border-[#fccf03] bg-stone-800 text-stone-100";
		const errorClasses = touched[fieldName] && errors[fieldName]
			? "border-red-500 focus:ring-red-500 focus:border-red-500"
			: "border-stone-700";
		return `${baseClasses} ${errorClasses}`;
	};

	// Handle country code selection
	const handleCountryCodeSelect = (dialCode: string) => {
		setFormData(prev => ({
			...prev,
			countryCode: dialCode
		}));
		setShowCountryList(false);

		if (touched.countryCode) {
			const countryCodeError = validateField('countryCode', dialCode);
			setErrors(prev => ({ ...prev, countryCode: countryCodeError, general: undefined }));
		}
	};

	// Add loan types array for selection
	const loanTypeOptions = [
		{ id: 1, name: "Personal Loan", description: "General purpose personal loans for various needs" },
		{ id: 2, name: "Business Loan", description: "Loans for business purposes and working capital" },
		{ id: 3, name: "Education Loan", description: "Loans for educational purposes and tuition fees" },
		{ id: 4, name: "Home Loan", description: "Loans for home improvements and renovations" }
	];

	// Employment type options
	const employmentTypeOptions = [
		"Full-time", 
		"Part-time", 
		"Contract", 
		"Self-employed", 
		"Unemployed"
	];

	// Render different form steps based on currentStep
	const renderFormStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<>
						<h3 className="text-lg font-semibold mb-4 text-stone-100">Personal Information</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="firstname" className="block text-sm font-medium text-stone-300 mb-1">
									First Name
								</label>
								<input
									id="firstname"
									name="firstname"
									type="text"
									value={formData.firstname}
									onChange={handleInputChange}
									onBlur={() => handleBlur('firstname')}
									className={getInputClassName('firstname')}
									placeholder="John"
								/>
								{touched.firstname && errors.firstname && (
									<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.firstname}</p>
								)}
							</div>
							<div>
								<label htmlFor="lastname" className="block text-sm font-medium text-stone-300 mb-1">
									Last Name
								</label>
								<input
									id="lastname"
									name="lastname"
									type="text"
									value={formData.lastname}
									onChange={handleInputChange}
									onBlur={() => handleBlur('lastname')}
									className={getInputClassName('lastname')}
									placeholder="Doe"
								/>
								{touched.lastname && errors.lastname && (
									<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.lastname}</p>
								)}
							</div>
						</div>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={formData.email}
								onChange={handleInputChange}
								onBlur={() => handleBlur('email')}
								className={getInputClassName('email')}
								placeholder="johndoe@example.com"
							/>
							{touched.email && errors.email && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.email}</p>
							)}
						</div>
						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-stone-300 mb-1">
								Phone Number
							</label>
							<div className="flex items-stretch">
								<div className="relative country-selector">
									<button
										type="button"
										className="flex items-center justify-between px-3 py-2 border border-stone-700 rounded-l-lg bg-stone-800 text-stone-300 h-[42px]"
										onClick={() => setShowCountryList(!showCountryList)}
										onBlur={() => handleBlur('countryCode')}
										style={{ display: 'flex', alignItems: 'center' }}
									>
										<span className="mr-2">{formData.countryCode}</span>
										<ChevronDown className="h-4 w-4 text-stone-500" />
									</button>

									{showCountryList && (
										<div className="absolute z-10 mt-1 w-64 max-h-60 overflow-y-auto bg-stone-800 border border-stone-700 rounded-md shadow-lg">
											<div className="sticky top-0 bg-stone-800 border-b border-stone-700 p-2">
												<input
													type="text"
													placeholder="Search countries..."
													className="w-full px-3 py-1 border border-stone-700 rounded bg-stone-800 text-stone-300 text-sm"
													value={countrySearch}
													onChange={(e) => setCountrySearch(e.target.value)}
													id="countrySearch"
													autoComplete="off"
													autoFocus
												/>
											</div>
											<ul className="py-1">
												{filteredCountries.map((country) => (
													<li
														key={country.code}
														className="px-3 py-2 hover:bg-stone-700 cursor-pointer flex items-center text-sm"
														onClick={() => {
															handleCountryCodeSelect(country.dial_code);
															setCountrySearch("");
														}}
													>
														<span className="w-16 inline-block font-medium">{country.dial_code}</span>
														<span className="ml-2">{country.name}</span>
													</li>
												))}
												{filteredCountries.length === 0 && (
													<li className="px-3 py-2 text-sm text-stone-500">
														No countries found
													</li>
												)}
											</ul>
										</div>
									)}
								</div>

								<input
									id="phone"
									name="phone"
									type="text"
									inputMode="numeric"
									value={formData.phone}
									onChange={handleInputChange}
									onBlur={() => handleBlur('phone')}
									className={`${getInputClassName('phone')} rounded-l-none flex-1 h-[42px]`}
									placeholder="712345678"
									style={{ lineHeight: 'normal' }}
								/>
							</div>

							{touched.countryCode && errors.countryCode && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.countryCode}</p>
							)}

							{touched.phone && errors.phone && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.phone}</p>
							)}
						</div>
						<div>
							<label htmlFor="idNumber" className="block text-sm font-medium text-stone-300 mb-1">
								ID Number
							</label>
							<input
								id="idNumber"
								name="idNumber"
								type="text"
								inputMode="numeric"
								value={formData.idNumber}
								onChange={handleInputChange}
								onBlur={() => handleBlur('idNumber')}
								className={getInputClassName('idNumber')}
								placeholder="1234567890123"
							/>
							{touched.idNumber && errors.idNumber && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.idNumber}</p>
							)}
						</div>
					</>
				);
			case 2:
				return (
					<>
						<h3 className="text-lg font-semibold mb-4 text-stone-100">Address & Demographics</h3>
						<div>
							<label htmlFor="address" className="block text-sm font-medium text-stone-300 mb-1">
								Residential Address
							</label>
							<input
								id="address"
								name="address"
								type="text"
								value={formData.address}
								onChange={handleInputChange}
								onBlur={() => handleBlur('address')}
								className={getInputClassName('address')}
								placeholder="123 Main St, Apartment 4B"
							/>
							{touched.address && errors.address && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.address}</p>
							)}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="city" className="block text-sm font-medium text-stone-300 mb-1">
									City
								</label>
								<input
									id="city"
									name="city"
									type="text"
									value={formData.city}
									onChange={handleInputChange}
									onBlur={() => handleBlur('city')}
									className={getInputClassName('city')}
									placeholder="Johannesburg"
								/>
								{touched.city && errors.city && (
									<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.city}</p>
								)}
							</div>
							<div>
								<label htmlFor="postalCode" className="block text-sm font-medium text-stone-300 mb-1">
									Postal Code
								</label>
								<input
									id="postalCode"
									name="postalCode"
									type="text"
									value={formData.postalCode}
									onChange={handleInputChange}
									onBlur={() => handleBlur('postalCode')}
									className={getInputClassName('postalCode')}
									placeholder="2000"
								/>
								{touched.postalCode && errors.postalCode && (
									<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.postalCode}</p>
								)}
							</div>
						</div>

						<div>
							<label htmlFor="ageGroup" className="block text-sm font-medium text-stone-300 mb-1">
								Age Group
							</label>
							<select
								id="ageGroup"
								name="ageGroup"
								value={formData.ageGroup}
								onChange={handleInputChange}
								onBlur={() => handleBlur('ageGroup')}
								className={getInputClassName('ageGroup')}
							>
								<option value="">Select age group</option>
								<option value="18-24">18-24</option>
								<option value="25-34">25-34</option>
								<option value="35-44">35-44</option>
								<option value="45-54">45-54</option>
								<option value="55-64">55-64</option>
								<option value="65+">65+</option>
							</select>
							{touched.ageGroup && errors.ageGroup && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.ageGroup}</p>
							)}
						</div>
						
						<div>
							<label htmlFor="incomeLevel" className="block text-sm font-medium text-stone-300 mb-1">
								Monthly Income Level
							</label>
							<select
								id="incomeLevel"
								name="incomeLevel"
								value={formData.incomeLevel}
								onChange={handleInputChange}
								onBlur={() => handleBlur('incomeLevel')}
								className={getInputClassName('incomeLevel')}
							>
								<option value="">Select income level</option>
								<option value="Under R5,000">Under R5,000</option>
								<option value="R5,000 - R10,000">R5,000 - R10,000</option>
								<option value="R10,001 - R20,000">R10,001 - R20,000</option>
								<option value="R20,001 - R30,000">R20,001 - R30,000</option>
								<option value="R30,001 - R50,000">R30,001 - R50,000</option>
								<option value="Above R50,000">Above R50,000</option>
							</select>
							{touched.incomeLevel && errors.incomeLevel && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.incomeLevel}</p>
							)}
						</div>
					</>
				);
			case 3:
				return (
					<>
						<h3 className="text-lg font-semibold mb-4 text-stone-100">Employment Information</h3>
						<div>
							<label htmlFor="employer" className="block text-sm font-medium text-stone-300 mb-1">
								Employer
							</label>
							<input
								id="employer"
								name="employer"
								type="text"
								value={formData.employer}
								onChange={handleInputChange}
								onBlur={() => handleBlur('employer')}
								className={getInputClassName('employer')}
								placeholder="Company Name"
							/>
							{touched.employer && errors.employer && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.employer}</p>
							)}
						</div>
						<div>
							<label htmlFor="employmentType" className="block text-sm font-medium text-stone-300 mb-1">
								Employment Type
							</label>
							<select
								id="employmentType"
								name="employmentType"
								value={formData.employmentType}
								onChange={handleInputChange}
								onBlur={() => handleBlur('employmentType')}
								className={getInputClassName('employmentType')}
							>
								<option value="">Select employment type</option>
								{employmentTypeOptions.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
							{touched.employmentType && errors.employmentType && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.employmentType}</p>
							)}
						</div>
						<div>
							<label htmlFor="occupation" className="block text-sm font-medium text-stone-300 mb-1">
								Job Occupation
							</label>
							<input
								id="occupation"
								name="occupation"
								type="text"
								value={formData.occupation}
								onChange={handleInputChange}
								onBlur={() => handleBlur('occupation')}
								className={getInputClassName('occupation')}
								placeholder="Software Developer"
							/>
							{touched.occupation && errors.occupation && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.occupation}</p>
							)}
						</div>
						<div>
							<label htmlFor="workAddress" className="block text-sm font-medium text-stone-300 mb-1">
								Work Address
							</label>
							<input
								id="workAddress"
								name="workAddress"
								type="text"
								value={formData.workAddress}
								onChange={handleInputChange}
								onBlur={() => handleBlur('workAddress')}
								className={getInputClassName('workAddress')}
								placeholder="123 Business St, City"
							/>
							{touched.workAddress && errors.workAddress && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.workAddress}</p>
							)}
						</div>
					</>
				);
			case 4:
				return (
					<>
						<h3 className="text-lg font-semibold mb-4 text-stone-100">Banking Details</h3>
						<div>
							<label htmlFor="accountNumber" className="block text-sm font-medium text-stone-300 mb-1">
								Account Number
							</label>
							<input
								id="accountNumber"
								name="accountNumber"
								type="text"
								inputMode="numeric"
								value={formData.accountNumber}
								onChange={handleInputChange}
								onBlur={() => handleBlur('accountNumber')}
								className={getInputClassName('accountNumber')}
								placeholder="1234567890"
							/>
							{touched.accountNumber && errors.accountNumber && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.accountNumber}</p>
							)}
						</div>
						<div>
							<label htmlFor="accountName" className="block text-sm font-medium text-stone-300 mb-1">
								Account Holder Name
							</label>
							<input
								id="accountName"
								name="accountName"
								type="text"
								value={formData.accountName}
								onChange={handleInputChange}
								onBlur={() => handleBlur('accountName')}
								className={getInputClassName('accountName')}
								placeholder="John Doe"
							/>
							{touched.accountName && errors.accountName && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.accountName}</p>
							)}
						</div>
						<div>
							<label htmlFor="accountType" className="block text-sm font-medium text-stone-300 mb-1">
								Account Type
							</label>
							<select
								id="accountType"
								name="accountType"
								value={formData.accountType}
								onChange={handleInputChange}
								onBlur={() => handleBlur('accountType')}
								className={getInputClassName('accountType')}
							>
								<option value="">Select account type</option>
								<option value="Savings">Savings</option>
								<option value="Checking">Checking</option>
								<option value="Current">Current</option>
							</select>
							{touched.accountType && errors.accountType && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.accountType}</p>
							)}
						</div>
						<div>
							<label htmlFor="bankName" className="block text-sm font-medium text-stone-300 mb-1">
								Bank Name
							</label>
							<input
								id="bankName"
								name="bankName"
								type="text"
								value={formData.bankName}
								onChange={handleInputChange}
								onBlur={() => handleBlur('bankName')}
								className={getInputClassName('bankName')}
								placeholder="Bank Name"
							/>
							{touched.bankName && errors.bankName && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.bankName}</p>
							)}
						</div>
						<div>
							<label htmlFor="payDate" className="block text-sm font-medium text-stone-300 mb-1">
								Monthly Pay Date
							</label>
							<input
								id="payDate"
								name="payDate"
								type="date"
								value={formData.payDate}
								onChange={handleInputChange}
								onBlur={() => handleBlur('payDate')}
								className={getInputClassName('payDate')}
							/>
							{touched.payDate && errors.payDate && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.payDate}</p>
							)}
						</div>
					</>
				);
			case 5:
				return (
					<>
						<h3 className="text-lg font-semibold mb-4 text-stone-100">Loan Details</h3>
						<div>
							<label htmlFor="loanTypeId" className="block text-sm font-medium text-stone-300 mb-1">
								Loan Type
							</label>
							<select
								id="loanTypeId"
								name="loanTypeId"
								value={formData.loanTypeId}
								onChange={handleInputChange}
								onBlur={() => handleBlur('loanTypeId')}
								className={getInputClassName('loanTypeId')}
							>
								<option value="">Select loan type</option>
								{loanTypeOptions.map((type) => (
									<option key={type.id} value={type.id}>
										{type.name} - {type.description}
									</option>
								))}
							</select>
							{touched.loanTypeId && errors.loanTypeId && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.loanTypeId}</p>
							)}
						</div>
						<div>
							<label htmlFor="loanAmount" className="block text-sm font-medium text-stone-300 mb-1">
								Loan Amount (R)
							</label>
							<input
								id="loanAmount"
								name="loanAmount"
								type="text"
								inputMode="numeric"
								value={formData.loanAmount}
								onChange={handleInputChange}
								onBlur={() => handleBlur('loanAmount')}
								className={getInputClassName('loanAmount')}
								placeholder="5000"
							/>
							{touched.loanAmount && errors.loanAmount && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.loanAmount}</p>
							)}
							<p className="text-xs text-stone-400 mt-1">Enter amount between R1,000 - R50,000</p>
						</div>
						<div>
							<label htmlFor="loanTermMonths" className="block text-sm font-medium text-stone-300 mb-1">
								Loan Term (Months)
							</label>
							<select
								id="loanTermMonths"
								name="loanTermMonths"
								value={formData.loanTermMonths}
								onChange={handleInputChange}
								onBlur={() => handleBlur('loanTermMonths')}
								className={getInputClassName('loanTermMonths')}
							>
								<option value="">Select loan term</option>
								{[6, 12, 18, 24, 36, 48, 60].map((months) => (
									<option key={months} value={months}>
										{months} months
									</option>
								))}
							</select>
							{touched.loanTermMonths && errors.loanTermMonths && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.loanTermMonths}</p>
							)}
						</div>
						<div>
							<label htmlFor="purpose" className="block text-sm font-medium text-stone-300 mb-1">
								Loan Purpose
							</label>
							<select
								id="purpose"
								name="purpose"
								value={formData.purpose}
								onChange={handleInputChange}
								onBlur={() => handleBlur('purpose')}
								className={getInputClassName('purpose')}
							>
								<option value="">Select purpose</option>
								<option value="Personal">Personal Expenses</option>
								<option value="Education">Education</option>
								<option value="Medical">Medical Expenses</option>
								<option value="Debt Consolidation">Debt Consolidation</option>
								<option value="Home Improvement">Home Improvement</option>
								<option value="Business">Business</option>
								<option value="Other">Other</option>
							</select>
							{touched.purpose && errors.purpose && (
								<p className="text-red-500 text-xs mt-1 animate-pulse">{errors.purpose}</p>
							)}
						</div>
					</>
				);
			default:
				return null;
		}
	};

	// Add this function to map step numbers to names
	const getStepName = (step: number): string => {
		switch (step) {
			case 1:
				return "Personal Information";
			case 2:
				return "Address & Demographics";
			case 3:
				return "Employment Information";
			case 4:
				return "Banking Details";
			case 5:
				return "Loan Details";
			default:
				return "Unknown Step";
		}
	};

	// Render the form based on current verification step
	const renderForm = () => {
		if (verificationStep === 'success') {
			// Success animation with updated styling
			return (
				<div className="flex flex-col items-center justify-center py-8">
					<div className="animate-bounce mb-4">
						<CheckCircle className="h-16 w-16 text-green-500" />
					</div>
					<h2 className="text-xl font-bold text-center mb-2 text-stone-100">Verification Successful!</h2>
					<p className="text-sm text-center text-stone-300">
						Redirecting to your dashboard...
					</p>
					<div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-[#fccf03] rounded-full animate-spin"></div>
				</div>
			);
		} else if (verificationStep === 'otp') {
			// OTP verification step with updated styling
			return (
				<>
					<h2 className="text-xl font-bold text-center mb-4 text-stone-100">Verify Your Phone</h2>
					<p className="text-sm text-center text-stone-300 mb-6">
						We've sent a verification code to {formatPhoneNumber(formData.phone, formData.countryCode)}
					</p>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="otp" className="block text-sm font-medium text-stone-300 mb-1 text-center">
								Verification Code
							</label>
							<input
								id="otp"
								name="otp"
								type="text"
								inputMode="numeric"
								value={otp}
								onChange={handleOtpChange}
								className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-[#fccf03] focus:border-[#fccf03] bg-stone-800 text-stone-100 text-center text-xl tracking-widest border-stone-700"
								placeholder="• • • • • •"
								maxLength={6}
								autoComplete="one-time-code"
								autoFocus
							/>
							{errors.otp && (
								<p className="text-red-500 text-xs mt-1 animate-pulse text-center">{errors.otp}</p>
							)}
						</div>

						{errors.general && (
							<div className="p-2 bg-red-900/20 border border-red-800 rounded-md">
								<p className="text-red-400 text-xs text-center">{errors.general}</p>
							</div>
						)}

						<div className="text-center">
							<button
								type="button"
								onClick={handleResendOTP}
								disabled={loading.submit}
								className="text-sm text-[#fccf03] hover:underline transition-colors duration-200"
							>
								{loading.submit ? "Sending..." : "Didn't receive the code? Resend"}
							</button>
						</div>

						<button
							type="submit"
							disabled={loading.verify || !recaptchaLoaded || !!recaptchaError}
							className={`w-full py-2 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${loading.verify || !recaptchaLoaded || !!recaptchaError
									? "bg-stone-600 text-stone-400 cursor-not-allowed opacity-70"
									: "bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md"
								}`}
						>
							{loading.verify ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Verifying
								</>
							) : (
								"Verify & Continue"
							)}
						</button>
					</form>
				</>
			);
		} else {
			// Registration step - show the form with steps and updated styling
			return (
				<>
					<h2 className="text-xl font-bold text-center mb-4 text-stone-100">Loan Application</h2>

					{/* Progress indicator - updated styling */}
					<div className="mb-6">
						<div className="flex justify-between">
							{Array.from({ length: totalSteps }, (_, i) => (
								<div key={i} className="flex flex-col items-center">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i < currentStep
												? "bg-[#fccf03] border-[#fccf03] text-black"
												: i === currentStep
													? "border-[#fccf03] text-[#fccf03]"
													: "border-stone-600 text-stone-500"
											}`}
									>
										{i < currentStep ? (
											<Check className="h-5 w-5" />
										) : (
											<span>{i + 1}</span>
										)}
									</div>
									{i < totalSteps - 1 && (
										<div className="h-1 w-16 bg-stone-700">
											<div
												className="h-1 bg-[#fccf03]"
												style={{ width: i < currentStep ? '100%' : '0%' }}
											></div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Form fields area - simplified height */}
						<div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-800">
							{renderFormStep()}
						</div>

						{/* Error message */}
						{errors.general && (
							<div className="p-2 bg-red-900/20 border border-red-800 rounded-md">
								<p className="text-red-400 text-xs">{errors.general}</p>
							</div>
						)}

						{/* Navigation buttons - updated styling */}
						<div className="flex justify-between items-center pt-2">
							{currentStep > 1 ? (
								<button
									type="button"
									onClick={handlePrevious}
									className="py-2 px-4 rounded-lg text-sm font-medium border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all duration-300 flex items-center"
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Previous
								</button>
							) : (
								<div></div> // Empty div to maintain flex alignment
							)}

							{currentStep < totalSteps ? (
								<button
									type="button"
									onClick={handleNext}
									className="py-2 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black transition-all duration-300 flex items-center"
								>
									Next
									<ArrowRight className="h-4 w-4 ml-2" />
								</button>
							) : (
								<div></div> // Empty div to maintain flex alignment when in last step
							)}
						</div>

						{/* Submit button for the last step */}
						{currentStep === totalSteps && (
							<button
								type="submit"
								disabled={loading.submit || !recaptchaLoaded || !!recaptchaError}
								className={`w-full py-3 px-4 mt-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
									loading.submit || !recaptchaLoaded || !!recaptchaError
										? "bg-stone-600 text-stone-400 cursor-not-allowed opacity-70"
										: "bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md"
								}`}
							>
								{loading.submit ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : recaptchaError ? (
									"reCAPTCHA Error"
								) : (
									"Submit Application"
								)}
							</button>
						)}
					</form>

					{/* Form step labels - updated styling */}
					<div className="mt-4 text-center">
						<p className="text-xs text-stone-400">
							Step {currentStep} of {totalSteps}: {getStepName(currentStep)}
						</p>
					</div>
				</>
			);
		}
	};

	// OTP verification step with updated styling
	return (
		<motion.div
			className="min-h-screen bg-black text-stone-100 relative overflow-hidden flex flex-col items-center justify-center p-2"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Background decorative elements with subtle animation */}
			<motion.div
				className="absolute top-0 left-0 w-full h-64 bg-[#fccf03]/10 -skew-y-6 transform -translate-y-32 z-0"
				animate={{ opacity: [0.7, 0.9, 0.7] }}
				transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
			></motion.div>
			<motion.div
				className="absolute bottom-0 right-0 w-full h-64 bg-[#fccf03]/10 skew-y-6 transform translate-y-32 z-0"
				animate={{ opacity: [0.7, 0.9, 0.7] }}
				transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", delay: 2 }}
			></motion.div>

			{/* Floating decorative circles with animation */}
			<motion.div
				className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
				animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
				transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
			></motion.div>
			<motion.div
				className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-tr from-[#fccf03]/20 to-[#fccf03]/5 blur-2xl"
				animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
				transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
			></motion.div>

			<div className="absolute top-2 left-2 z-10">
				<button
					onClick={() => router.push('/')}
					className="group flex items-center text-stone-300 hover:bg-stone-800/60 px-3 py-1.5 rounded-full transition-all duration-300 ease-in-out transform hover:-translate-x-1"
				>
					<ArrowLeft
						className="mr-2 h-5 w-5 text-stone-400 group-hover:text-[#fccf03] transition-colors duration-300"
					/>
					<span className="text-sm font-medium text-stone-300 group-hover:text-[#fccf03] transition-colors duration-300">
						Back to Home
					</span>
				</button>
			</div>

			<motion.div
				className="bg-gradient-to-br from-stone-800 to-stone-900 shadow-xl rounded-lg p-6 max-w-2xl w-full border border-stone-700 relative z-10"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="flex items-center justify-center mb-4 space-x-2">
					<Box className="w-8 h-8 text-[#fccf03]" />
					<span className="text-2xl font-bold text-stone-100 tracking-tight">Ubuntu Loan</span>
				</div>

				{renderForm()}
			</motion.div>
		</motion.div>
	);
}