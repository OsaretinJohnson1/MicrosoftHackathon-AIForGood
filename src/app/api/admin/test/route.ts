import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  console.log('Admin test API called');
  
  try {
    const session = await auth();
    
    return NextResponse.json({
      message: 'Admin API test successful',
      time: new Date().toISOString(),
      session: session ? {
        user: {
          name: session.user?.name,
          email: session.user?.email,
          isAdmin: session.user?.isAdmin,
        }
      } : null
    }, { status: 200 });
    
  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json({
      message: 'Test API encountered an error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 