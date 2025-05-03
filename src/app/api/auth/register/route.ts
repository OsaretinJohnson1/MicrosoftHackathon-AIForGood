import { NextRequest, NextResponse } from "next/server";
import { users } from "@/database/AI-For-Good/schema";
import { registerSchema, loanApplicationSchema } from "@/lib/definitions";
import { cookies } from 'next/headers';
import Tokens from 'csrf';
import { createUserData, getUserByField } from "@/lib/utils";
import seedDatabase from "@/database/seed";
import { db } from "@/database/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";


const tokens = new Tokens();

// Function to validate CSRF token
async function validateCSRF(request: NextRequest) {
    const csrfHeader = request.headers.get('x-csrf-token');
    const cookieStore = await cookies();
    const secretCookie = cookieStore.get('csrf-secret')?.value;

    if (!csrfHeader || !secretCookie) {
        return {
            valid: false,
            error: "Missing CSRF token or secret",
            status: 403
        };
    }

    const isValidToken = tokens.verify(secretCookie, csrfHeader);
    if (!isValidToken) {
        return {
            valid: false,
            error: "CSRF token verification failed",
            status: 403
        };
    }

    return { valid: true };
}

// Function to verify reCAPTCHA
async function verifyRecaptcha(recaptchaToken: string) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        return {
            valid: false,
            error: "reCAPTCHA secret key not configured",
            status: 500
        };
    }

    try {
        const recaptchaResponse = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const result = await recaptchaResponse.json();

        if (!result.success) {
            if (result['error-codes']?.includes('invalid-input-response')) {
                return {
                    valid: false,
                    error: "Invalid reCAPTCHA token - possible wrong site key",
                    status: 400
                };
            }
            return {
                valid: false,
                error: "reCAPTCHA verification unsuccessful",
                status: 400
            };
        }

        if (!('score' in result)) {
            return {
                valid: false,
                error: "No reCAPTCHA score provided",
                status: 400
            };
        }

        if (result.score < 0.5) {
            return {
                valid: false,
                error: "reCAPTCHA score too low",
                status: 400
            };
        }

        if (!result.action || result.action !== 'submit') {
            return {
                valid: false,
                error: "Incorrect reCAPTCHA action",
                status: 400
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: "Unexpected reCAPTCHA error",
            status: 400
        };
    }
}

// Function to register a new user
async function registerUser(userData: {
    email: string,
    password?: string,
    firstname: string,
    lastname: string,
    countryCode: string,
    phone: string,
    idNumber?: string,
    isLoanApplication?: boolean
}) {
    try {
        // Check if user with this email already exists
        const existingUser = await getUserByField('email', userData.email, users, { limit: 1 });

        if (existingUser) {
            return {
                success: false,
                error: "Email is already registered",
                field: "email",
                status: 400
            };
        }

        // Format the full phone number with country code
        const fullPhoneNumber = `${userData.countryCode}${userData.phone}`;

        // Check if user with this phone already exists
        if (fullPhoneNumber) {
            const existingPhone = await getUserByField('phone', fullPhoneNumber, users, { limit: 1 });

            if (existingPhone) {
                return {
                    success: false,
                    error: "Phone number is already registered",
                    field: "phone",
                    status: 400
                };
            }
        }

        // Check if user with this id number already exists
        if (userData.idNumber) {
            const existingIdNumber = await getUserByField('idNumber', userData.idNumber, users, { limit: 1 });

            if (existingIdNumber) {
                return {
                    success: false,
                    error: "ID number is already registered",
                    field: "idNumber",
                    status: 400
                };
            }
        }

        // // Generate a random password for loan applications or use the provided password
        // let password = userData.password;

        // if (!password || userData.isLoanApplication) {
        //     // Generate a random password with 12 characters
        //     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        //     let randomPassword = '';
        //     for (let i = 0; i < 12; i++) {
        //         randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        //     }
        //     password = randomPassword;

        //     // In a real application, you would send this password to the user via email or SMS
        //     console.log(`Generated random password for ${userData.email}: ${password}`);
        // }

        // // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await createUserData({
            email: userData.email,
            // password: hashedPassword,
            firstname: userData.firstname,
            lastname: userData.lastname,
            phone: fullPhoneNumber, // Store the full phone number with country code
            activated: 1,
            verified: 0,
            idNumber: userData.idNumber || '', // Use provided ID number or empty string
            userStatus: 0, // Set userStatus to 0 for regular client users
            isAdmin: 0, // Ensure isAdmin is also set to 0 for consistency
            logins: 0,
            signupDate: new Date().toISOString()
        }, users);

        // Get the newly created user
        const newUser = await getUserByField('email', userData.email, users, { limit: 1 });

        if (!newUser) {
            return {
                success: false,
                error: "User registration failed",
                status: 500
            };
        }

        // TypeScript fix: ensure we're treating newUser as a single object, not an array
        const userObject = Array.isArray(newUser) ? newUser[0] : newUser;

        return {
            success: true,
            user: userObject
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: "An unexpected error occurred during registration",
            status: 500
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstname, lastname } = body;
        
        // Check for missing required fields
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        if (!firstname) missingFields.push("firstname");
        if (!lastname) missingFields.push("lastname");
        
        if (missingFields.length > 0) {
            return NextResponse.json({ 
                error: `Missing required fields: ${missingFields.join(", ")}` 
            }, { status: 400 });
        }
        
        // Check if user with this email already exists
        const existingUser = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        
        if (existingUser.length > 0) {
            return NextResponse.json({ 
                error: "Email is already registered" 
            }, { status: 409 });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the user
        const result = await db.insert(users).values({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            activated: 1,
            verified: 0,
            userStatus: 0,
            isAdmin: 0,
            logins: 0,
            signupDate: new Date().toISOString()
        });
        
        if (!result) {
            return NextResponse.json({ 
                error: "Failed to create user account" 
            }, { status: 500 });
        }
        
        // Get the newly created user
        const newUser = await db.select({
            id: users.id,
            email: users.email,
            firstname: users.firstname,
            lastname: users.lastname,
            signupDate: users.signupDate
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
        
        return NextResponse.json({
            message: "User registered successfully",
            user: newUser[0]
        }, { status: 201 });
        
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ 
            error: `Error processing registration: ${error instanceof Error ? error.message : String(error)}` 
        }, { status: 500 });
    }
}


// old code for registration not optimized
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/firebase/firebaseConfig";
// import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
// import { signIn } from "@/auth";
// import { registerSchema } from "@/lib/definitions";
// import { cookies } from 'next/headers';
// import Tokens from 'csrf';

// const tokens = new Tokens();

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     // Get CSRF token from request header and cookie
//     const csrfHeader = request.headers.get('x-csrf-token');
//     const cookieStore = await cookies();
//     const secretCookie = cookieStore.get('csrf-secret')?.value;

//     // Debug CSRF values
//     console.log('CSRF Header:', csrfHeader);
//     console.log('CSRF Secret Cookie:', secretCookie);
//     console.log('All cookies:', cookieStore.getAll());

//     // Validate CSRF requirements
//     if (!csrfHeader) {
//       console.log('Missing CSRF header');
//       return NextResponse.json(
//         { errors: { general: "Missing CSRF token" } },
//         { status: 403 }
//       );
//     }

//     if (!secretCookie) {
//       console.log('Missing CSRF secret cookie');
//       return NextResponse.json(
//         { errors: { general: "Missing CSRF secret" } },
//         { status: 403 }
//       );
//     }

//     // Verify CSRF token
//     const isValidToken = tokens.verify(secretCookie, csrfHeader);
//     console.log('CSRF token verification result:', isValidToken ? 'true' : 'false');
//     console.log('CSRF verification details:', {
//       secretCookie,
//       csrfHeader,
//       isValid: isValidToken
//     });

//     if (!isValidToken) {
//       console.log('Invalid CSRF token verification');
//       console.log('Secret used:', secretCookie);
//       console.log('Token to verify:', csrfHeader);
//       return NextResponse.json(
//         { errors: { general: "Invalid CSRF token" } },
//         { status: 403 }
//       );
//     }

//     // Parse and validate request body
//     const result = registerSchema.safeParse(body);

//     if (!result.success) {
//       const validationErrors: Record<string, string> = {};
//       result.error.errors.forEach((error) => {
//         const field = error.path[0] as string;
//         validationErrors[field] = error.message;
//       });
//       return NextResponse.json({ errors: validationErrors }, { status: 400 });
//     }

//     const { email, password, recaptchaToken } = result.data;

//     // Verify reCAPTCHA token
//     if (!recaptchaToken) {
//       return NextResponse.json(
//         { errors: { general: "reCAPTCHA verification required" } },
//         { status: 400 }
//       );
//     }

//     let recaptchaVerified = false;

//     try {
//       // Verify reCAPTCHA token with Google's API
//       const recaptchaResponse = await fetch(
//         `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//           }
//         }
//       );

//       const recaptchaResult = await recaptchaResponse.json();

//       if (!recaptchaResult.success) {
//         if (recaptchaResult['error-codes']?.includes('invalid-input-response')) {
//           return NextResponse.json(
//             { errors: { general: "Invalid reCAPTCHA token - possible wrong site key used" } },
//             { status: 400 }
//           );
//         }

//         return NextResponse.json(
//           { errors: { general: "reCAPTCHA verification failed" } },
//           { status: 400 }
//         );
//       }

//       if (!('score' in recaptchaResult)) {
//         return NextResponse.json(
//           { errors: { general: "Invalid reCAPTCHA response - no score" } },
//           { status: 400 }
//         );
//       }

//       if (recaptchaResult.score < 0.5) {
//         return NextResponse.json(
//           { errors: { general: "reCAPTCHA score too low" } },
//           { status: 400 }
//         );
//       }

//       // debug recaptchaResult
//       console.log('reCAPTCHA Result:', recaptchaResult);

//       if (!recaptchaResult.action || recaptchaResult.action !== 'submit') {
//         return NextResponse.json(
//           { errors: { general: "Invalid reCAPTCHA action" } },
//           { status: 400 }
//         );
//       }

//       recaptchaVerified = true;

//     } catch (error) {
//       return NextResponse.json(
//         { errors: { general: error instanceof Error ? error.message : "reCAPTCHA verification failed" } },
//         { status: 400 }
//       );
//     }

//     // Only proceed with user creation if reCAPTCHA verification passed
//     if (!recaptchaVerified) {
//       return NextResponse.json(
//         { errors: { general: "reCAPTCHA verification required" } },
//         { status: 400 }
//       );
//     }

//     let user; // Declare the user variable outside of the try-catch block

//     try {
//       // Create Firebase user
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       user = userCredential.user; // Assign the user

//       // Sign in with NextAuth
//       await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//         token: await user.getIdToken(), // Get Firebase ID token
//         provider: "credentials",
//         recaptchaToken: recaptchaToken
//       });

//       // Success response
//       return NextResponse.json(
//         {
//           message: "User registered successfully",
//           userId: user.uid,
//           redirect: "/dashboard"
//         },
//         { status: 201 }
//       );

//     } catch (error: any) {
//       console.error('SignIn error:', error);

//       // If user is created, delete the Firebase user in case of failure
//       if (user) {
//         try {
//           await deleteUser(user); // Delete the Firebase user
//           console.log('Firebase user deleted successfully');
//         } catch (deleteError) {
//           console.error('Error deleting user:', deleteError);
//         }
//       }
//       // Handle Firebase Auth errors
//       if (error.code === "auth/email-already-in-use") {
//         return NextResponse.json(
//           { errors: { email: "Email is already registered" } },
//           { status: 400 }
//         );
//       }

//       if (error.code === "auth/invalid-email") {
//         return NextResponse.json(
//           { errors: { email: "Invalid email address" } },
//           { status: 400 }
//         );
//       }

//       if (error.code === "auth/operation-not-allowed") {
//         return NextResponse.json(
//           { errors: { general: "Email/password accounts are not enabled" } },
//           { status: 403 }
//         );
//       }

//       throw new Error(error as string);
//     }

//   } catch (error: any) {
//     console.error('Registration error:', error);

//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }
