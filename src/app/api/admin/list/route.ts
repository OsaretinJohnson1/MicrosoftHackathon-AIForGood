import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/database/db'
import { users } from '@/database/ubuntu-lend/schema'
import { desc, eq, or, like, and } from 'drizzle-orm'
// import { getServerSession } from 'next-auth'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  console.log('Admin list API called');
  try {
    // Verify the current user is an admin
    console.log('Verifying admin session');
    const session = await auth()
    
    console.log('Session:', session?.user ? 'Authenticated' : 'Not authenticated');
    
    if (!session || !session.user) {
      console.log('No session or user found');
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Verify the current user has admin privileges
    console.log('Checking admin privileges:', session.user.isAdmin);
    if (session.user.isAdmin !== 1 && session.user.isAdmin !== 2) {
      console.log('Not an admin user:', session.user.isAdmin);
      return NextResponse.json(
        { message: 'Access denied. You need administrator privileges.' }, 
        { status: 403 }
      )
    }
    
    // Parse pagination parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search') || ''
    
    console.log('Query parameters:', { page, pageSize, search });
    
    // Calculate offset
    const offset = (page - 1) * pageSize
    
    // Build query condition for admins (isAdmin = 1 or isAdmin = 2)
    const adminCondition = or(eq(users.isAdmin, 1), eq(users.isAdmin, 2));
    
    // Define conditions based on search parameter
    let queryCondition;
    if (search) {
      const searchCondition = or(
        like(users.firstname, `%${search}%`),
        like(users.lastname, `%${search}%`),
        like(users.email, `%${search}%`),
        like(users.phone, `%${search}%`)
      );
      queryCondition = and(adminCondition, searchCondition);
    } else {
      queryCondition = adminCondition;
    }
    
    // Safe logging for query condition (don't stringify the entire object)
    console.log('Admin listing query with search:', search ? 'yes' : 'no');
    
    try {
      // Get total count for pagination
      console.log('Executing count query');
      const countResult = await db
        .select({ count: db.fn.count(users.id) })
        .from(users)
        .where(queryCondition)
      
      console.log('Count result:', countResult);
      
      const totalAdmins = Number(countResult[0]?.count || 0)
      const totalPages = Math.ceil(totalAdmins / pageSize)
      
      console.log('Pagination info:', { totalAdmins, totalPages });
      
      // Fetch paginated admin users
      console.log('Executing admin users query');
      const adminUsers = await db.select({
        id: users.id,
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        isAdmin: users.isAdmin,
        lastLogin: users.lastLogin,
        logins: users.logins,
        signupDate: users.signupDate
      })
      .from(users)
      .where(queryCondition)
      .orderBy(desc(users.id))
      .limit(pageSize)
      .offset(offset)
      
      console.log(`Found ${adminUsers.length} admin users`);
      
      return NextResponse.json({
        admins: adminUsers,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalAdmins
        }
      }, { status: 200 })
    } catch (dbError) {
      console.error('Database error:', String(dbError));
      // Return a safe error message without circular references
      return NextResponse.json(
        { message: 'Database query failed', error: String(dbError) }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching admin users:', String(error));
    return NextResponse.json(
      { message: 'Failed to retrieve admin users', error: String(error) }, 
      { status: 500 }
    )
  }
} 