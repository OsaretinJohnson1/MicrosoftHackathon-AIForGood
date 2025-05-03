import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../database/AI-For-Good/schema";
import { db } from "../../../../database/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateJWT } from "../../../../lib/jwt";

// API route handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        // Check for missing required fields
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        
        if (missingFields.length > 0) {
            return NextResponse.json({ 
                error: `Missing required fields: ${missingFields.join(", ")}` 
            }, { status: 400 });
        }
        
        // Find user by email
        const userResults = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (userResults.length === 0) {
            return NextResponse.json({ 
                error: "Invalid email or password" 
            }, { status: 401 });
        }
        
        const user = userResults[0];
        
        // Check if password exists
        if (!user.password) {
            return NextResponse.json({ 
                error: "Account requires password reset" 
            }, { status: 401 });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return NextResponse.json({ 
                error: "Invalid email or password" 
            }, { status: 401 });
        }
        
        // Update last login
        await db.update(users)
            .set({ 
                lastLogin: new Date().toISOString(),
                logins: user.logins + 1
            })
            .where(eq(users.id, user.id));
        
        // Generate JWT token
        const token = await generateJWT({
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin === 1
        });
        
        // Return user info and token (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword,
            token
        }, { status: 200 });
        
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ 
            error: `Error processing login: ${error instanceof Error ? error.message : String(error)}` 
        }, { status: 500 });
    }
}
