import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../database/AI-For-Good/schema";
import { db } from "../../../../database/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// API route handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ 
                success: false,
                error: "Email and password are required" 
            }, { status: 400 });
        }
        
        // Find user by email
        const userResults = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        
        if (userResults.length === 0) {
            // Don't reveal whether the email exists or not for security
            return NextResponse.json({ 
                success: false,
                error: "Invalid credentials" 
            }, { status: 401 });
        }
        
        const user = userResults[0];
        
        // Check if user has a password
        if (!user.password) {
            return NextResponse.json({ 
                success: false,
                error: "Account requires password reset" 
            }, { status: 401 });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return NextResponse.json({ 
                success: false,
                error: "Invalid credentials" 
            }, { status: 401 });
        }
        
        // Update login count and timestamp
        await db.update(users)
            .set({ 
                logins: (user.logins || 0) + 1,
                lastLogin: new Date().toISOString()
            })
            .where(eq(users.id, user.id));
        
        // Return user data without sensitive information
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                isAdmin: user.isAdmin
            }
        });
        
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ 
            success: false,
            error: "Server error" 
        }, { status: 500 });
    }
}
