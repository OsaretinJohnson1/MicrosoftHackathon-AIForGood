import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { eq } from 'drizzle-orm';
import { temporaryGoogleProfiles } from '@/database/AI-For-Good/schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (provider !== 'google') {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Find the temporary profile by token
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

    // Clean up any sensitive data before sending to client
    return NextResponse.json({
      profile: {
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
      }
    });
  } catch (error) {
    console.error('Error retrieving temporary profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
} 