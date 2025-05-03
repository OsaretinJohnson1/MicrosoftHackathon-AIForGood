import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../database/db';
import { users } from '../../../../database/ubuntu-lend/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../../../auth';

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

// Helper function to create a user from session data
async function createUserFromSession(session: any) {
  try {
    if (!session || !session.user || !session.user.email) {
      throw new Error("Invalid session data");
    }
    
    // Split name into first and last name
    const fullName = session.user.name || '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstname = nameParts[0] || 'User';
    const lastname = nameParts.slice(1).join(' ') || '';
    
    // Create user in database
    const result = await db.insert(users).values({
      email: session.user.email,
      firstname: firstname,
      lastname: lastname,
      password: '', // Empty password for OAuth users
      phone: '', // Will need to be completed by user
      idNumber: '', // Will need to be completed by user
      profilePic: session.user.image || session.user.picture || null,
      activated: 1, // Auto-activate Google users
      verified: 1, // Auto-verify Google users
      isAdmin: 0, // Default to regular user
      userStatus: 0, // Default to regular user
      signupDate: new Date().toISOString(),
    });
    
    // Get the newly created user
    const newUser = await db.select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    
    if (newUser.length === 0) {
      throw new Error("Failed to retrieve created user");
    }
    
    return newUser[0];
  } catch (error) {
    console.error("Error creating user from session:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const session = await auth();
    
    // Check if user is authenticated through Google
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user's email from the session
    const userEmail = session.user.email;
    
    // Query the database for the user by email
    const userData = await db.select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    
    // Check if user exists in our database
    let userExists = userData.length > 0;
    let userRecord = userExists ? userData[0] : null;
    
    // Check if auto-create parameter is provided
    const shouldAutoCreate = request.nextUrl.searchParams.get('auto_create') === 'true';
    
    // If user doesn't exist and auto-create is enabled, create the user
    if (!userExists && shouldAutoCreate) {
      try {
        userRecord = await createUserFromSession(session);
        userExists = true;
        console.log("Auto-created user for Google account:", userEmail);
      } catch (error) {
        console.error("Failed to auto-create user:", error);
        return NextResponse.json({
          success: false,
          message: 'Failed to auto-create user account',
          error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }
    
    if (!userExists) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'User does not exist in the database',
        googleData: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || null
        }
      });
    }
    
    // User exists, return their data
    return NextResponse.json({
      success: true,
      exists: true,
      data: {
        ...userRecord,
        isAdmin: userRecord?.isAdmin === 1 || userRecord?.userStatus === 1,
        // Don't expose sensitive data
        password: undefined
      }
    });
    
  } catch (error: unknown) {
    console.error('Error in GET /api/crud-users/google-user:', error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch Google user data',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 