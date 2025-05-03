import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/database/ubuntu-lend/schema';
import { getUserByField } from '@/lib/utils';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('id');
    
    // Get current authenticated user
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Convert session user ID to number
    const currentUserId = Number(session.user.id);
    
    // Check if the user is an admin (userStatus or isAdmin)
    const isAdmin = session.user.userStatus === 1 || session.user.isAdmin === 1;
    
    // If no specific ID is requested, return the current user's data
    if (!requestedUserId) {
      // Fetch current user data
      const userData = await getUserByField('id', currentUserId, users, { limit: 1 });
      
      if (!userData) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: userData
      });
    }
    
    // Convert requested ID to number
    let idToSearch = Number(requestedUserId);
    
    // Handle formatted IDs (e.g., CUST-123)
    if (requestedUserId.startsWith('CUST-')) {
      idToSearch = Number(requestedUserId.replace('CUST-', ''));
    }
    
    if (isNaN(idToSearch)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Security check: Only admins can view other users' data
    if (!isAdmin && idToSearch !== currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Access denied - you can only view your own profile' },
        { status: 403 }
      );
    }
    
    // Fetch user data
    const userData = await getUserByField('id', idToSearch, users, { limit: 1 });
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return the user data
    return NextResponse.json({
      success: true,
      data: userData
    });
    
  } catch (error: unknown) {
    console.error('Error in GET /api/crud-users/user:', error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user data',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 