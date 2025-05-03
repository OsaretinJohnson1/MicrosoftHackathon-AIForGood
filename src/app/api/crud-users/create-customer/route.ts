import { NextRequest, NextResponse } from "next/server";
import { users, customerDetails } from "../../../../database/ubuntu-lend/schema";
import { cookies } from 'next/headers';
import Tokens from 'csrf';
import * as bcrypt from 'bcryptjs';
import { createUserData, getUserByField } from "../../../../lib/utils";
import { sendSMS, generateWelcomeMessage } from "../../../../lib/otp-utils";

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

// Function to register a new user
async function registerCustomer(userData: {
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    countryCode: string,
    phone: string,
    idNumber?: string,
    isAdmin?: number
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insert user into database
        await createUserData({
            email: userData.email,
            password: hashedPassword,
            firstname: userData.firstname,
            lastname: userData.lastname,
            phone: fullPhoneNumber, // Store the full phone number with country code
            signupDate: new Date(), // Store current date
            activated: 1,
            verified: 1, // Set as verified since admin is creating
            idNumber: userData.idNumber || '',
            userStatus: 0, // Active user
            isAdmin: userData.isAdmin || 0 // Use provided isAdmin value or default to 0
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
        console.error("Error creating customer:", error);
        return {
            success: false,
            error: "An unexpected error occurred during customer creation",
            status: 500
        };
    }
}

// Function to save additional customer details
async function saveCustomerDetails(userId: number, customerData: {
    company?: string;
    address?: string;
    creditLimit?: number | null;
    joinDate?: string;
    tags?: string;
    notes?: string;
    status?: string;
}) {
    try {
        await createUserData({
            userId,
            company: customerData.company || '',
            address: customerData.address || '',
            creditLimit: customerData.creditLimit || 0,
            joinDate: customerData.joinDate ? new Date(customerData.joinDate) : new Date(),
            tags: customerData.tags || '',
            notes: customerData.notes || '',
            status: customerData.status || 'Active',
            createdAt: new Date(),
            updatedAt: new Date()
        }, customerDetails);

        return { success: true };
    } catch (error) {
        console.error("Error saving customer details:", error);
        return {
            success: false,
            error: "Failed to save customer details",
            status: 500
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        // Validate CSRF
        const csrfResult = await validateCSRF(request);
        if (!csrfResult.valid) {
            return NextResponse.json(
                { error: csrfResult.error, success: false },
                { status: csrfResult.status }
            );
        }

        // Parse request body
        const body = await request.json();
        const { userData, customerData } = body;

        // Check for required fields
        if (!userData.email || !userData.firstname || !userData.lastname || !userData.phone) {
            return NextResponse.json(
                { error: "Missing required fields", success: false },
                { status: 400 }
            );
        }

        // Register the user
        const registrationResult = await registerCustomer(userData);

        if (!registrationResult.success) {
            return NextResponse.json(
                {
                    error: registrationResult.error,
                    field: registrationResult.field,
                    success: false
                },
                { status: registrationResult.status || 500 }
            );
        }

        // Save additional customer details if user registration was successful
        const userId = registrationResult.user?.id;

        if (userId) {
            const detailsResult = await saveCustomerDetails(userId, customerData);

            if (!detailsResult.success) {
                return NextResponse.json(
                    { error: detailsResult.error, success: false },
                    { status: detailsResult.status || 500 }
                );
            }

            // Send welcome SMS to the new customer
            try {
                const fullName = `${userData.firstname} ${userData.lastname}`;
                const isAdmin = userData.isAdmin === 1;
                const welcomeMessage = await generateWelcomeMessage(fullName, isAdmin);
                const phoneNumber = `${userData.countryCode}${userData.phone}`;

                // Send SMS asynchronously (don't await) to not block the response
                sendSMS(phoneNumber, welcomeMessage)
                    .then(result => {
                        console.log(`Welcome SMS to ${fullName} (${phoneNumber}): ${result.success ? 'Sent' : 'Failed'}`);
                    })
                    .catch(error => {
                        console.error(`Error sending welcome SMS to ${phoneNumber}:`, error);
                    });
            } catch (smsError) {
                // Log the error but don't fail the request
                console.error('Error sending welcome SMS:', smsError);
            }
        }

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Customer created successfully",
                userId: userId,
                name: `${userData.firstname} ${userData.lastname}`
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Customer creation error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred", success: false },
            { status: 500 }
        );
    }
} 