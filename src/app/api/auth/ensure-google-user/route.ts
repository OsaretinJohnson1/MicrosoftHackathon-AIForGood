import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../database/db';
import { users } from '../../../../database/ubuntu-lend/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../../../auth';
import { randomBytes } from 'crypto';

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log("API: ensure-google-user endpoint called");
  
  try {
    // Get current authenticated user
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.error("API: ensure-google-user - No authenticated session found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get the user's email from the session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      console.error("API: ensure-google-user - No email found in session");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    console.log(`API: ensure-google-user - Processing user with email: ${userEmail}`);
    
    // Check if user already exists in the database
    let user = await db.select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    
    let isNewUser = false;
    
    // If user doesn't exist, create a new user
    if (user.length === 0) {
      console.log(`API: ensure-google-user - Creating new user for email: ${userEmail}`);
      isNewUser = true;
      
      // Split name into first and last name
      const fullName = session.user.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstname = nameParts[0] || 'User';
      const lastname = nameParts.slice(1).join(' ') || '';
      
      console.log("Preparing user data for insertion:", {
        email: userEmail,
        firstname,
        lastname,
        hasImage: !!session.user.image|| null
      });
      
      // Insert new user
      await db.insert(users).values({
        email: userEmail,
        firstname: firstname,
        lastname: lastname,
        password: '', // Empty password for OAuth users
        phone: 'NEEDS_UPDATE', // Placeholder that's consistent with create-account
        idNumber: `G${Date.now().toString(36).substring(4, 13)}`, // Timestamp-based unique ID within 13 chars
        profilePic: session.user.image || null,
        activated: 1, // Auto-activate Google users
        verified: 1, // Auto-verify Google users
        isAdmin: 0, // Default to regular user
        userStatus: 0, // Default to regular user
        signupDate: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''), // Format date correctly for MySQL
      });
      
      console.log("User inserted successfully, retrieving the new user");
      
      // Get the newly created user
      user = await db.select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);
      
      if (user.length === 0) {
        throw new Error("Failed to create user - user not found after insertion");
      }
      
      console.log("Google user creation complete:", userEmail);
    } else {
      console.log(`API: ensure-google-user - User already exists with ID: ${user[0].id}`);
    }
    
    return NextResponse.json({
      id: user[0].id,
      email: user[0].email,
      isNewUser,
      user: {
        ...user[0],
        isAdmin: user[0].isAdmin === 1,
        // Don't expose sensitive data
        password: undefined
      }
    });
  } catch (error) {
    console.error("API: ensure-google-user - Error:", error);
    return NextResponse.json(
      { error: "Failed to ensure user" },
      { status: 500 }
    );
  }
} 