import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../database/db';
import { users } from '../../../../database/ubuntu-lend/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../../../auth';

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log("API: check-google-user endpoint called");
  
  try {
    // Get current authenticated user from Google OAuth
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.error("API: check-google-user - No authenticated session found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get the user's email from the session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      console.error("API: check-google-user - No email found in session");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    console.log(`API: check-google-user - Checking if user exists with email: ${userEmail}`);
    
    // Check if user already exists in the database
    const user = await db.select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    
    if (user.length === 0) {
      // User doesn't exist
      console.log(`API: check-google-user - User doesn't exist with email: ${userEmail}`);
      
      // Store user info in session for later use during confirmation
      return NextResponse.json({
        exists: false,
        email: userEmail,
        name: session.user.name,
        image: session.user.image
      });
    } else {
      // User exists
      console.log(`API: check-google-user - User exists with ID: ${user[0].id}`);
      
      return NextResponse.json({
        exists: true,
        user: {
          ...user[0],
          isAdmin: user[0].isAdmin === 1,
          // Don't expose sensitive data
          password: undefined
        }
      });
    }
  } catch (error) {
    console.error("API: check-google-user - Error:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
} 