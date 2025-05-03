import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { users } from '@/database/ubuntu-lend/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get email from query parameter
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Query the database to check if the user exists
    const existingUsers = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    // Return result indicating if user exists
    return NextResponse.json({
      success: true,
      exists: existingUsers.length > 0,
      userData: existingUsers.length > 0 ? {
        id: existingUsers[0].id,
        email: existingUsers[0].email,
        name: `${existingUsers[0].firstname} ${existingUsers[0].lastname}`.trim(),
        isAdmin: existingUsers[0].isAdmin,
        userStatus: existingUsers[0].userStatus,
      } : null
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check user existence' },
      { status: 500 }
    );
  }
} 