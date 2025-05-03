import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "../../../../lib/definitions";
import { cookies } from 'next/headers';
import Tokens from 'csrf';


const tokens = new Tokens();

export async function POST(request: NextRequest) {
	try {
		let body;
		try {
			body = await request.json();
		} catch (error) {
			return NextResponse.json(
				{ errors: { general: error } },
				{ status: 400 }
			);
		}

		// Get CSRF token from request header and cookie
		const csrfHeader = request.headers.get('x-csrf-token');
		const cookieStore = await cookies();
		const secretCookie = cookieStore.get('csrf-secret')?.value;

		// // Debug CSRF values
		console.log('CSRF Header:', csrfHeader);
		// console.log('CSRF Secret Cookie:', secretCookie);
		// console.log('All cookies:', cookieStore.getAll());

		// Validate CSRF requirements
		if (!csrfHeader) {
			// console.log('Missing CSRF header');
			return NextResponse.json(
				{ errors: { general: "Missing CSRF token" } },
				{ status: 403 }
			);
		}

		if (!secretCookie) {
			// console.log('Missing CSRF secret cookie');
			return NextResponse.json(
				{ errors: { general: "Missing CSRF secret" } },
				{ status: 403 }
			);
		}


		// Verify CSRF token
		const isValidToken = tokens.verify(secretCookie, csrfHeader);
		// console.log('CSRF token verification result:', isValidToken ? 'true' : 'false');
		// console.log('CSRF verification details:', {
		// 	secretCookie,
		// 	csrfHeader,
		// 	isValid: isValidToken
		// });


		if (!isValidToken) {
			// console.log('Invalid CSRF token verification');
			// console.log('Secret used:', secretCookie);
			// console.log('Token to verify:', csrfHeader);
			return NextResponse.json(

				{ errors: { general: "Invalid CSRF token" } },
				{ status: 403 }
			);
		}

		// Parse and validate request body
		const result = forgotPasswordSchema.safeParse(body);

		if (!result.success) {
			const validationErrors: Record<string, string> = {};
			result.error.errors.forEach((error) => {
				const field = error.path[0] as string;
				validationErrors[field] = error.message;
			});
			return NextResponse.json({ errors: validationErrors }, { status: 400 });
		}

		const { email } = result.data;

		// // Verify reCAPTCHA token
		// if (!recaptchaToken) {
		// 	return NextResponse.json(
		// 		{ errors: { general: "reCAPTCHA verification required" } },
		// 		{ status: 400 }
		// 	);
		// }

		try {
			// Verify reCAPTCHA token with Google's API
			// const recaptchaResponse = await fetch(
			// 	`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
			// 	{
			// 		method: 'POST',
			// 		headers: {
			// 			'Content-Type': 'application/x-www-form-urlencoded'
			// 		}
			// 	}
			// );

			// const recaptchaResult = await recaptchaResponse.json();

			// if (!recaptchaResult.success) {
			// 	return NextResponse.json(
			// 		{ errors: { general: "reCAPTCHA verification failed" } },
			// 		{ status: 400 }
			// 	);
			// }

			// if (!('score' in recaptchaResult)) {
			// 	return NextResponse.json(
			// 		{ errors: { general: "Invalid reCAPTCHA response - no score" } },
			// 		{ status: 400 }
			// 	);
			// }

			// if (recaptchaResult.score < 0.5) {
			// 	return NextResponse.json(
			// 		{ errors: { general: "reCAPTCHA score too low" } },
			// 		{ status: 400 }
			// 	);
			// }

			// if (!recaptchaResult.action || recaptchaResult.action !== 'forgot_password') {
			// 	return NextResponse.json(
			// 		{ errors: { general: "Invalid reCAPTCHA action" } },
			// 		{ status: 400 }
			// 	);
			// }

			try {

				// await getAuth().getUserByEmail(email)
				// .then((userRecord: any) => {
				// 	console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
				// })

				// .catch((error: any) => {
				// 	console.log('Error fetching user data:', error);
				// });

				// Send password reset emailc
				const sendPasswordResetEmail= async (email:string)=>{

				}
				const response = await sendPasswordResetEmail(email)
					.then((response) => {
						return NextResponse.json(
							{
								message: response,
							},
							{ status: 200 }
						);
					})
					.catch((error) => {
						const errorCode = error.code;

						if (errorCode === "auth/user-not-found") {
							return NextResponse.json(
								{ errors: { email: "No account found with this email address" } },
								{ status: 400 }
							);
						}

						if (errorCode === "auth/invalid-email") {
							return NextResponse.json(
								{ errors: { email: "Please enter a valid email address" } },
								{ status: 400 }
							);
						}

						if (errorCode === "auth/too-many-requests") {
							return NextResponse.json(
								{ errors: { general: "Too many attempts. Please try again later" } },
								{ status: 429 }
							);
						}

						return NextResponse.json(
							{ errors: { general: error.message || "Failed to send reset email. Please try again" } },
							{ status: 500 }
						);
					});

				console.log('Password reset response:', response);
				if (response.status === 200) {
					return NextResponse.json({
						message: "Email sent."
					}, { status: 200 });
				}

			} catch (error: any) {
				return NextResponse.json(
					{ errors: { general: error.message || "Failed to send reset email. Please try again" } },
					{ status: 500 }
				);
			}

		} catch (error: any) {
			return NextResponse.json(
				{ errors: { general: "reCAPTCHA verification failed" } },
				{ status: 400 }
			);
		}

	} catch (error: any) {
		console.error('Forgot password error:', error);
		return NextResponse.json(
			{ errors: { general: "An unexpected error occurred. Please try again" } },
			{ status: 500 }
		);
	}
}
