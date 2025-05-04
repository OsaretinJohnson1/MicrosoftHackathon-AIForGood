import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { eq } from 'drizzle-orm';
import { temporaryGoogleProfiles, users } from '@/database/AI-For-Good/schema';
import { randomBytes } from 'crypto';
import { signIn } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, provider } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (provider !== 'google') {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Find the temporary profile
    const tempProfiles = await db
      .select()
      .from(temporaryGoogleProfiles)
      .where(eq(temporaryGoogleProfiles.token, token))
      .limit(1);

    if (tempProfiles.length === 0) {
      return NextResponse.json({ error: 'Profile not found or expired' }, { status: 404 });
    }

    const tempProfile = tempProfiles[0];
    const profileData = JSON.parse(tempProfile.profileData);

    // Check if user already exists (double-check)
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, profileData.email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create new user from profile data
    // Extract name parts
    let firstname = '';
    let lastname = '';
    
    if (profileData.name) {
      const nameParts = profileData.name.split(' ');
      if (nameParts.length >= 1) {
        firstname = nameParts[0];
      }
      if (nameParts.length >= 2) {
        lastname = nameParts.slice(1).join(' ');
      }
    }

    // Insert new user
    const insertResult = await db.insert(users).values({
      email: profileData.email,
      firstname: firstname || 'User',
      lastname: lastname || ' ',
      profilePic: profileData.picture || null,
      // Generate default values for required fields
      phone: 'NEEDS_UPDATE', // Placeholder, user will need to update later
      idNumber: `G${Date.now().toString(36).substring(4, 13)}`, // Timestamp-based unique ID within 13 chars
      password: randomBytes(16).toString('hex'), // Random password since login is via Google
      roleId: 2, // Default to regular user
      activated: 1, // Google account is already verified
      verified: 1, // Google account is already verified
      signupDate: new Date(),
      userStatus: 1, // Active status
      isAdmin: 0,
      deleted: 0,
      logins: 0,
      delStatus: 0,
      // Add any other required fields based on your schema
    });

    // Clean up temporary profile
    await db
      .delete(temporaryGoogleProfiles)
      .where(eq(temporaryGoogleProfiles.token, token));

    // Get the newly created user to ensure we have the ID and all data
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.email, profileData.email))
      .limit(1);

    if (newUser.length === 0) {
      throw new Error("User was created but could not be retrieved");
    }

    const user = newUser[0];

    // Instead of trying to use the signIn method here, return the necessary
    // data to the client to perform the sign-in client-side
    return NextResponse.json({ 
      success: true,
      message: "Account created successfully",
      redirectUrl: '/auth/login?email=' + encodeURIComponent(user.email) + '&accountCreated=true',
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        name: `${user.firstname || ""} ${user.lastname || ""}`.trim() || "User",
        image: user.profilePic,
        userStatus: user.userStatus,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account', details: String(error) }, { status: 500 });
  }
} 