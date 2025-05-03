import { NextRequest, NextResponse } from "next/server";
import { users } from "@/database/AI-For-Good/schema";
import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import bcrypt from "bcrypt";
import { signIn } from "@/auth";

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
        
        // Format the date properly for MySQL
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        
        // Create user data
        const userData = {
            email,
            password: hashedPassword,
            firstname,
            lastname,
            activated: 1,
            verified: 0,
            userStatus: 0,
            isAdmin: 0,
            logins: 0,
            signupDate: formattedDate
        };
        
        console.log("Creating user with data:", { ...userData, password: "[REDACTED]" });
        
        // Create the user
        const result = await db.insert(users).values(userData);
        
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
        
        if (!newUser.length) {
            return NextResponse.json({ 
                error: "User created but not found" 
            }, { status: 500 });
        }
        
        // Create Next.js Auth session
        try {
            // Attempt to sign in with NextAuth
            await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
        } catch (authError) {
            console.error("Error signing in after registration:", authError);
            // We'll still return success since the user was created successfully
            // The frontend will handle signin separately if this fails
        }
        
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
