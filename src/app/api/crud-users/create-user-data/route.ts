// app/api/crud-users/create-user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../database/ubuntu-lend/schema';
import { createUserData } from '../../../../lib/utils';
import { auth } from '../../../../auth';

export async function POST(request: NextRequest) {
  try {
    // Get the session for authorization check
    const session = await auth();

    // Only allow authenticated users (could add admin check here if needed)
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    // Parse the request body to get the user data
    const userData = await request.json();

    if (!userData || Object.keys(userData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No user data provided',
      }, { status: 400 });
    }

    try {
      // Create user data using the utility function
      const result = await createUserData(userData, users);

      console.log('User created:', result);

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        result
      });
    } catch (queryError: unknown) {
      console.error('Error in database query:', queryError);

      // Extract error message
      let errorMessage = 'Unknown database error';
      if (queryError instanceof Error) {
        errorMessage = queryError.message;
      }

      return NextResponse.json({
        success: false,
        message: 'Failed to create user',
        error: errorMessage,
        details: typeof queryError === 'object' ? queryError : String(queryError)
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Error in route handler:', error);

    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create user',
      error: errorMessage,
      // Only include stack in development
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

