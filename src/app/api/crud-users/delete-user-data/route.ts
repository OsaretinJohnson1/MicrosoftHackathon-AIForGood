import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../database/ubuntu-lend/schema';
import { getUserById, updateUserDataMultipleFields } from '../../../../lib/utils';
import { auth } from '../../../../auth';

export async function DELETE(request: NextRequest) {
  try {
    // Get the session for authorization check
    const session = await auth();
    
    // Only allow authenticated users
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }
    
    // Get the user ID to delete from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'No user ID provided',
      }, { status: 400 });
    }
    
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user ID format',
      }, { status: 400 });
    }
    
    try {
      // Check if user exists
      const user = await getUserById(userIdNum, users);
      
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found',
        }, { status: 404 });
      }
      
      // Soft delete the user by setting status to 1
      const result = await updateUserDataMultipleFields(userIdNum, {
        status: 1
      }, users);
      
      console.log('User soft deleted:', result);
      
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
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
        message: 'Failed to delete user',
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
      message: 'Failed to delete user',
      error: errorMessage,
      // Only include stack in development
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
