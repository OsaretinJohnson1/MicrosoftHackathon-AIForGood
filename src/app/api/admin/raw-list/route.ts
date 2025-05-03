import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/database/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  console.log('Raw admin list API called');
  try {
    // Verify the current user is an admin
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Verify the current user has admin privileges
    if (session.user.isAdmin !== 1 && session.user.isAdmin !== 2) {
      return NextResponse.json(
        { message: 'Access denied. You need administrator privileges.' }, 
        { status: 403 }
      )
    }
    
    // Parse pagination parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize
    
    try {
      // Get count using raw SQL
      const countQuery = sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE isAdmin IN (1, 2)
      `;
      
      const countResult = await db.execute(countQuery);
      console.log('Count result:', countResult);
      
      const totalAdmins = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(totalAdmins / pageSize);
      
      // Get admin users using raw SQL
      const usersQuery = sql`
        SELECT id, firstname, lastname, email, phone, roleId, isAdmin, lastLogin, logins, signupDate
        FROM users
        WHERE isAdmin IN (1, 2)
        ORDER BY id DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      
      const rawResult = await db.execute(usersQuery);
      console.log('Raw result structure:', JSON.stringify(rawResult).substring(0, 100) + '...');
      
      // Fix nested array structure by flattening the array
      const adminUsers = Array.isArray(rawResult[0]) ? rawResult[0] : rawResult;
      
      console.log(`Found ${adminUsers.length} admin users`);
      console.log('Sample admin user:', adminUsers.length > 0 ? JSON.stringify(adminUsers[0]) : 'None');
      
      return NextResponse.json({
        admins: adminUsers,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalAdmins
        }
      }, { status: 200 });
      
    } catch (dbError) {
      console.error('Database error:', String(dbError));
      return NextResponse.json(
        { message: 'Database query failed', error: String(dbError) }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching admin users:', String(error));
    return NextResponse.json(
      { message: 'Failed to retrieve admin users', error: String(error) }, 
      { status: 500 }
    );
  }
} 