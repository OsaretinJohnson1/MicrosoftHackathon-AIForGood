// app/api/crud-users/update-user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../database/ubuntu-lend/schema';
import { auth } from '../../../../auth'; // uses your next-auth config
import { updateUserDataMultipleFields } from '../../../../lib/utils';

// Define allowed fields for update
const ALLOWED_FIELDS = [
  'firstname', 
  'lastname', 
  'phone', 
  'idNumber',  // Add ID number field
  'address', 
  'city', 
  'postalCode',
  'state',     // Add state/province field
  'country',   // Add country field
  'employer',  // Add employer field
  // Add demographic fields
  'ageGroup',
  'gender',
  'occupation',
  'incomeLevel',
  'monthlyIncome', // Add monthly income field
  // Add bank details
  'bankDetails'
];

export async function PUT(request: NextRequest) {
  try {
    // Get the session using the App Router `auth()` helper
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    // Get the data to update from request body
    const updateData = await request.json();
    
    // Log the raw update data for debugging
    console.log('Raw update data received:', updateData);
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data provided for update',
      }, { status: 400 });
    }

    // Filter out any fields that aren't allowed to be updated
    const sanitizedData = Object.keys(updateData).reduce((acc, key) => {
      if (ALLOWED_FIELDS.includes(key)) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {} as Record<string, any>);
    
    // Log the sanitized data for debugging
    console.log('Sanitized data after filtering:', sanitizedData);

    // Validate demographic fields
    if (sanitizedData.gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(sanitizedData.gender)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid gender value',
      }, { status: 400 });
    }

    if (sanitizedData.ageGroup && !['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].includes(sanitizedData.ageGroup)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid age group value',
      }, { status: 400 });
    }

    if (sanitizedData.incomeLevel && 
        !['Under R5,000', 'R5,000 - R10,000', 'R10,001 - R20,000', 'R20,001 - R30,000', 'R30,001 - R50,000', 'Above R50,000'].includes(sanitizedData.incomeLevel)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid income level value',
      }, { status: 400 });
    }

    try {
      // Update user data with multiple fields
      const result = await updateUserDataMultipleFields(userId, sanitizedData, users);

      console.log('User data updated:', result);

      return NextResponse.json({
        success: true,
        message: 'User data updated successfully',
        updatedFields: {
          state: sanitizedData.state || null,
          country: sanitizedData.country || null,
          employer: sanitizedData.employer || null
        }
      });
    } catch (queryError: unknown) {
      console.error('Error in database query:', queryError);
      
      // Extract error message
      let errorMessage = 'Unknown database error';
      if (queryError instanceof Error) {
        errorMessage = queryError.message;
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update user data',
          error: errorMessage,
          details: typeof queryError === 'object' ? queryError : String(queryError)
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in route handler:', error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user data',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
