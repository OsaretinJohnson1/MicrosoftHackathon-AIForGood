"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Loader2, Eye, EyeOff, ChevronDown, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Tokens from 'csrf';
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/Header";

const tokens = new Tokens();

interface FormErrors {
	email?: string;
	cellPhone?: string;
	countryCode?: string;
	general?: string;
}

interface ValidationState {
	email: boolean;
	cellPhone: boolean;
	countryCode: boolean;
}

interface CountryCode {
	code: string;
	name: string;
	dial_code: string;
}

// Country codes array with dial codes (same as in login page)
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

export default function AccountRecoveryPage() {
	const [email, setEmail] = useState("");
	const [cellPhone, setCellPhone] = useState("");
	const [countryCode, setCountryCode] = useState("+27"); // Default to South Africa
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<ValidationState>({
		email: false,
		cellPhone: false,
		countryCode: false,
	});
	const [loading, setLoading] = useState(false);
	const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
	const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [csrfSecret, setCsrfSecret] = useState<string | null>(null);
	const [csrfToken, setCsrfToken] = useState<string | null>(null);
	const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('email');
	const [step, setStep] = useState<'method' | 'success'>('method');
	const [showCountryList, setShowCountryList] = useState(false);
	const [countrySearch, setCountrySearch] = useState("");
	const router = useRouter();

	// Filter countries based on search term
	const filteredCountries = countrySearch 
		? countryCodes.filter(country => 
			country.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
			country.dial_code.includes(countrySearch))
		: countryCodes;

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
			if (!(window as any).grecaptcha) {
				setRecaptchaError("reCAPTCHA failed to load - invalid site key");
				setRecaptchaLoaded(false);
				return;
			}

			(window as any).grecaptcha.ready(() => {
				try {
					(window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'forgot_password' })
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

	// Validation functions
	const validateEmail = (email: string): string | undefined => {
		if (!email) {
			return "Email is required";
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return "Please enter a valid email address";
		}
		return undefined;
	};

	const validateCountryCode = (code: string): string | undefined => {
		if (!code) {
			return "Country code is required";
		}
		return undefined;
	};

	const validateCellPhone = (cellPhone: string): string | undefined => {
		if (!cellPhone) {
			return "Cell Phone Number is required";
		}
		const cellPhoneRegex = /^[0-9]{1,45}$/;
		if (!cellPhoneRegex.test(cellPhone)) {
			return "Please enter a valid cell phone number";
		}
		return undefined;
	};

	// Handle country code selection
	const handleCountryCodeSelect = (dialCode: string) => {
		setCountryCode(dialCode);
		setShowCountryList(false);
		
		if (touched.countryCode) {
			const countryCodeError = validateCountryCode(dialCode);
			setErrors(prev => ({ ...prev, countryCode: countryCodeError, general: undefined }));
		}
	};

	// Handle input changes with validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newEmail = e.target.value;
		setEmail(newEmail);
		if (touched.email) {
			const emailError = validateEmail(newEmail);
			setErrors(prev => ({ ...prev, email: emailError, general: undefined }));
		}
		// Clear success message when user starts typing again
		setSuccessMessage(null);
	};

	// Handle cell phone input changes
	const handleCellPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newCellPhone = e.target.value.replace(/[^0-9]/g, '');
		setCellPhone(newCellPhone);
		if (touched.cellPhone) {
			const cellPhoneError = validateCellPhone(newCellPhone);
			setErrors(prev => ({ ...prev, cellPhone: cellPhoneError, general: undefined }));
		}
		// Clear success message when user starts typing again
		setSuccessMessage(null);
	};

	// Handle input blur
	const handleBlur = (field: keyof ValidationState) => {
		setTouched(prev => ({ ...prev, [field]: true }));
		
		if (field === 'email') {
			const emailError = validateEmail(email);
			setErrors(prev => ({ ...prev, email: emailError, general: undefined }));
		} else if (field === 'cellPhone') {
			const cellPhoneError = validateCellPhone(cellPhone);
			setErrors(prev => ({ ...prev, cellPhone: cellPhoneError, general: undefined }));
		} else if (field === 'countryCode') {
			const countryCodeError = validateCountryCode(countryCode);
			setErrors(prev => ({ ...prev, countryCode: countryCodeError, general: undefined }));
		}
	};

	// Format phone number to international format (remove leading zero if present)
	const formatPhoneNumber = (phone: string, code: string): string => {
		// Remove leading zero if present
		const cleanedPhone = phone.startsWith('0') ? phone.substring(1) : phone;
		return `${code}${cleanedPhone}`;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Verify CSRF token matches secret
		if (!csrfToken || !csrfSecret || !tokens.verify(csrfSecret, csrfToken)) {
			setErrors({ general: "Invalid security token. Please refresh the page." });
			return;
		}

		if (!recaptchaLoaded || recaptchaError) {
			setErrors({ general: recaptchaError || "reCAPTCHA verification required" });
			return;
		}

		if (recoveryMethod === 'email') {
			// Validate email before submission
			const emailError = validateEmail(email);
			setTouched(prev => ({ ...prev, email: true }));

			if (emailError) {
				setErrors({
					email: emailError,
					general: undefined
				});
				return;
			}
		} else {
			// Validate phone before submission
			const countryCodeError = validateCountryCode(countryCode);
			const cellPhoneError = validateCellPhone(cellPhone);
			
			setTouched(prev => ({ 
				...prev, 
				cellPhone: true,
				countryCode: true 
			}));

			if (countryCodeError || cellPhoneError) {
				setErrors({
					countryCode: countryCodeError,
					cellPhone: cellPhoneError,
					general: undefined
				});
				return;
			}
		}

		setLoading(true);
		setErrors({});
		setSuccessMessage(null);

		try {
			if (!recaptchaLoaded || !(window as any).grecaptcha?.execute) {
				throw new Error('reCAPTCHA has not loaded properly. Please refresh the page and try again.');
			}

			let recaptchaToken;
			try {
				recaptchaToken = await (window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'account_recovery' });
			} catch (err) {
				setErrors({ general: 'reCAPTCHA verification failed' });
				return;
			}

			if (!recaptchaToken) {
				setErrors({ general: 'reCAPTCHA verification failed' });
				return;
			}

			// Format phone number if phone method is selected
			const formattedPhone = recoveryMethod === 'phone' 
				? formatPhoneNumber(cellPhone, countryCode)
				: undefined;

			const response = await fetch('/api/auth/recover-account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrfToken
				},
				body: JSON.stringify({
					recoveryMethod,
					email: recoveryMethod === 'email' ? email : undefined,
					phoneNumber: formattedPhone,
					recaptchaToken,
					csrfToken
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					setErrors(data.errors);
				} else {
					throw new Error(data.error || 'Failed to send recovery instructions');
				}
				return;
			}

			// Show success message and update UI
			setSuccessMessage(recoveryMethod === 'email'
				? "Recovery instructions have been sent to your email address."
				: "Recovery instructions have been sent to your phone number."
			);
			setStep('success');
			
			// Clear the form
			setEmail("");
			setCellPhone("");
			setTouched({ 
				email: false,
				cellPhone: false,
				countryCode: false
			});

		} catch (error: any) {
			console.error('Account recovery error:', error);
			setErrors({ general: error.message || 'Failed to send recovery instructions. Please try again.' });
		} finally {
			setLoading(false);
		}
	};

	// Compute input field classes based on validation state
	const getInputClassName = (fieldName: keyof ValidationState) => {
		const baseClasses = "mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-[#fccf03] focus:border-[#fccf03] bg-stone-800 text-white";
		const errorClasses = touched[fieldName] && errors[fieldName as keyof FormErrors] 
			? "border-red-500 focus:ring-red-500 focus:border-red-500" 
			: "border-stone-700";
		return `${baseClasses} ${errorClasses}`;
	};

	return (
		<motion.div 
			className="min-h-screen bg-gradient-to-bl from-gray-900 to-black overflow-hidden relative flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative z-50 w-full">
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
			
			<div className="flex-1 flex items-center justify-center p-4 pt-16">
				<motion.div 
					className="bg-gradient-to-br from-stone-800 to-stone-900 shadow-xl rounded-lg p-6 max-w-md w-full border border-stone-700 relative z-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="flex items-center justify-center mb-4 space-x-2">
						<Box className="w-8 h-8 text-[#fccf03]" />
						<span className="text-2xl font-bold text-stone-100 tracking-tight">Ubuntu Loan</span>
					</div>
					
					{step === 'method' ? (
						<>
							<h2 className="text-xl font-bold text-center mb-4 text-stone-100">Account Recovery</h2>
							<p className="text-sm text-center text-stone-300 mb-4">
								Recover access to your account using your email or phone number
							</p>
							
							<div className="mb-6 flex rounded-lg overflow-hidden">
								<button
									type="button"
									onClick={() => setRecoveryMethod('email')}
									className={`flex-1 py-2 transition-all duration-200 font-medium text-sm ${
										recoveryMethod === 'email'
											? 'bg-[#fccf03] text-black'
											: 'bg-stone-700 text-stone-300 hover:bg-stone-600'
									}`}
								>
									Email
								</button>
								<button
									type="button"
									onClick={() => setRecoveryMethod('phone')}
									className={`flex-1 py-2 transition-all duration-200 font-medium text-sm ${
										recoveryMethod === 'phone'
											? 'bg-[#fccf03] text-black'
											: 'bg-stone-700 text-stone-300 hover:bg-stone-600'
									}`}
								>
									Phone
								</button>
							</div>
							
							<form onSubmit={handleSubmit} className="space-y-4">
								<input type="hidden" name="_csrf" value={csrfToken || ''} />
								
								{recoveryMethod === 'email' ? (
									<div>
										<label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-1">
											Email Address
										</label>
										<input
											id="email"
											name="email"
											type="email"
											value={email}
											onChange={handleEmailChange}
											onBlur={() => handleBlur('email')}
											className={getInputClassName('email')}
											placeholder="Your email address"
										/>
										{touched.email && errors.email && (
											<p className="text-red-500 text-xs mt-1">{errors.email}</p>
										)}
									</div>
								) : (
									<div>
										<label htmlFor="cellPhone" className="block text-sm font-medium text-stone-300 mb-1">
											Cell Phone Number
										</label>
										<div className="flex items-stretch">
											<div className="relative country-selector">
												<button
													type="button"
													className="flex items-center justify-between px-3 py-2 border border-r-0 border-stone-700 rounded-l-lg bg-stone-800 text-stone-100 h-[42px]"
													onClick={() => setShowCountryList(!showCountryList)}
													onBlur={() => handleBlur('countryCode')}
												>
													<span className="mr-2">{countryCode}</span>
													<ChevronDown className="h-4 w-4 text-stone-400" />
												</button>
												
												{showCountryList && (
													<div className="absolute z-10 mt-1 w-64 max-h-60 overflow-y-auto bg-stone-800 border border-stone-700 rounded-md shadow-lg">
														<div className="sticky top-0 bg-stone-800 border-b border-stone-700 p-2">
															<input
																type="text"
																placeholder="Search countries..."
																className="w-full px-3 py-1 border-2 border-stone-700 rounded bg-stone-800 text-stone-100 text-sm"
																value={countrySearch}
																onChange={(e) => setCountrySearch(e.target.value)}
																id="countrySearch"
																autoComplete="off"
																autoFocus
															/>
														</div>
														<ul className="py-1">
															{filteredCountries.map(country => (
																<li 
																	key={country.code}
																	className="px-3 py-2 hover:bg-stone-700 cursor-pointer text-sm text-stone-300 hover:text-stone-100 transition-colors"
																	onClick={() => handleCountryCodeSelect(country.dial_code)}
																>
																	{country.name} ({country.dial_code})
																</li>
															))}
														</ul>
													</div>
												)}
											</div>
											<input
												id="cellPhone"
												name="cellPhone"
												type="tel"
												inputMode="tel"
												placeholder="Your phone number"
												value={cellPhone}
												onChange={handleCellPhoneChange}
												onBlur={() => handleBlur('cellPhone')}
												className="block w-full px-4 py-2 border-2 border-stone-700 rounded-r-lg bg-stone-800 text-stone-100 focus:ring-[#fccf03] focus:border-[#fccf03] h-[42px]"
											/>
										</div>
										{touched.cellPhone && errors.cellPhone && (
											<p className="text-red-500 text-xs mt-1">{errors.cellPhone}</p>
										)}
										{touched.countryCode && errors.countryCode && (
											<p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>
										)}
									</div>
								)}
								
								{(errors.general || recaptchaError) && (
									<div className="p-2 bg-red-900/20 border border-red-800 rounded-md">
										<p className="text-red-400 text-xs">{errors.general || recaptchaError}</p>
									</div>
								)}
								
								<div className="flex justify-between text-xs pt-2">
									<Link
										href="/auth/login"
										className="font-medium text-[#fccf03] hover:underline transition-colors duration-200"
									>
										Back to Login
									</Link>
								</div>
								
								<button
									type="submit"
									disabled={loading || !recaptchaLoaded || !!recaptchaError || !csrfToken}
									className={`w-full py-2 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
										loading || !recaptchaLoaded || !!recaptchaError || !csrfToken
											? "bg-stone-600 text-stone-400 cursor-not-allowed opacity-70"
											: "bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] active:from-[#d6af00] active:to-[#c9a400] text-black hover:shadow-md"
									}`}
								>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										"Send Recovery Instructions"
									)}
								</button>
							</form>
						</>
					) : (
						// Success animation
						<div className="flex flex-col items-center justify-center py-8">
							<div className="animate-bounce mb-4">
								<CheckCircle className="h-16 w-16 text-green-500" />
							</div>
							<h2 className="text-xl font-bold text-center mb-2 text-stone-100">Instructions Sent!</h2>
							<p className="text-sm text-center text-stone-300">
								{successMessage}
							</p>
							<button
								onClick={() => router.push('/auth/login')}
								className="mt-6 py-2 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#fccf03] to-[#e0b800] hover:from-[#e0b800] hover:to-[#d6af00] text-black hover:shadow-md flex items-center"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Login
							</button>
						</div>
					)}
					
					{step === 'method' && (
						<div className="relative my-4">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-stone-700"></span>
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="px-2 bg-stone-900 text-stone-400">
									Or try other options
								</span>
							</div>
						</div>
					)}
					
					{step === 'method' && (
						<button
							onClick={() => window.open('mailto:support@ubuntuloan.com')}
							className="w-full flex items-center justify-center py-2 px-4 border border-stone-700 rounded-lg shadow-sm bg-stone-800 text-stone-100 hover:bg-stone-700 transition-all duration-300 text-sm"
						>
							Contact Support
						</button>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}
