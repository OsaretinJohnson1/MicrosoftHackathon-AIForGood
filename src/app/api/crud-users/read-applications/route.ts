import { NextRequest, NextResponse } from 'next/server';
import { applications, users } from '@/database/ubuntu-lend/schema';
import { db } from '../../../../database/db';
import { eq, desc, asc, and, like, sql } from 'drizzle-orm';
import { getUserByField, queryWithConditions } from '../../../../lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if a specific application ID is requested
    const applicationId = searchParams.get('id');
    // Check if applications for a specific user are requested
    const userId = searchParams.get('userId');
    
    // If applicationId is provided, fetch a single application
    if (applicationId) {
      // If the ID has a "APP-" prefix, extract the numeric part
      const idToSearch = applicationId.startsWith('APP-') 
        ? Number(applicationId.replace('APP-', '')) 
        : Number(applicationId);

      if (isNaN(idToSearch)) {
        return NextResponse.json(
          { success: false, message: 'Invalid application ID format' },
          { status: 400 }
        );
      }

      try {
        // Use the getUserByField utility for the application
        const applicationData = await getUserByField('id', idToSearch, applications, { limit: 1 });
        
        if (!applicationData) {
          return NextResponse.json(
            { success: false, message: 'Application not found' },
            { status: 404 }
          );
        }
        
        // Check if applicationData is an array (in case limit: 1 doesn't work as expected)
        const appData = Array.isArray(applicationData) ? applicationData[0] : applicationData;
        
        // Get user data related to this application
        const userData = await getUserByField('id', appData.userId, users, { limit: 1 });
        
        // Handle userData which could be an array or object
        let userDataObj = null;
        if (userData) {
          if (Array.isArray(userData)) {
            userDataObj = userData[0];
          } else {
            userDataObj = userData;
          }
        }
        
        // Combine the data
        const result = {
          application: appData,
          user: userDataObj ? {
            id: userDataObj.id,
            firstname: userDataObj.firstname,
            lastname: userDataObj.lastname,
            email: userDataObj.email,
            phone: userDataObj.phone
          } : null
        };

        // Return the application data
        return NextResponse.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json(
          { success: false, message: 'Error fetching application', error: String(error) },
          { status: 500 }
        );
      }
    }
    // If userId is provided, fetch all applications for that user
    else if (userId) {
      // If the ID has a "CUST-" prefix, extract the numeric part
      const userIdToSearch = userId.startsWith('CUST-') 
        ? Number(userId.replace('CUST-', '')) 
        : Number(userId);

      if (isNaN(userIdToSearch)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      try {
        // For this case, we need a custom query since we need to join tables
        const query = db
          .select({
            application: applications,
            user: {
              id: users.id,
              firstname: users.firstname,
              lastname: users.lastname,
              email: users.email,
              phone: users.phone
            }
          })
          .from(applications)
          .leftJoin(users, eq(applications.userId, users.id))
          .where(eq(applications.userId, userIdToSearch))
          .orderBy(desc(applications.applicationDate));

        const results = await query;
        
        // Format the results to match the expected structure in the UI
        const formattedResults = results.map((item: any) => ({
          id: `APP-${item.application.id.toString().padStart(4, '0')}`,
          name: `${item.user?.firstname || ''} ${item.user?.lastname || ''}`.trim() || 'Unknown',
          amount: `R${parseFloat(item.application.loanAmount.toString()).toLocaleString('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          term: `${item.application.loanTermMonths} months`,
          purpose: item.application.purpose || 'Not specified',
          status: item.application.status.charAt(0).toUpperCase() + item.application.status.slice(1),
          date: new Date(item.application.applicationDate).toLocaleDateString('en-ZA', {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
          }),
          interestRate: `${item.application.interestRate}%`,
          userId: item.application.userId,
          raw: {
            ...item.application,
            user: item.user
          }
        }));

        return NextResponse.json({
          success: true,
          data: formattedResults
        });
      } catch (error) {
        console.error('Error fetching user applications:', error);
        return NextResponse.json(
          { success: false, message: 'Error fetching user applications', error: String(error) },
          { status: 500 }
        );
      }
    } 
    // Otherwise, fetch all applications with filtering and pagination
    else {
      const page = Number(searchParams.get('page') || 1);
      const limit = Number(searchParams.get('limit') || 10);
      const orderBy = searchParams.get('orderBy') || 'id';
      const orderDirection = (searchParams.get('orderDirection') || 'asc') as 'asc' | 'desc';
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      
      try {
        // For pagination with complex joins, we need to use custom queries
        
        // Debug logging for search parameters
        console.log('API Search Parameters:', {
          page,
          limit,
          orderBy,
          orderDirection,
          search: search ? `"${search}"` : 'none',
          status: status ? `"${status}"` : 'all'
        });
        
        // Build the conditions SQL
        let conditionsSql = sql`1=1`; // Default condition that's always true
        
        if (search) {
          console.log('Searching for term:', search);
          conditionsSql = sql`${conditionsSql} AND (
            ${applications.purpose} LIKE ${`%${search}%`} OR 
            ${applications.id} LIKE ${`%${search}%`} OR
            ${users.firstname} LIKE ${`%${search}%`} OR
            ${users.lastname} LIKE ${`%${search}%`} OR
            CONCAT(${users.firstname}, ' ', ${users.lastname}) LIKE ${`%${search}%`}
          )`;
        }
        
        if (status && status !== 'all') {
          conditionsSql = sql`${conditionsSql} AND ${applications.status} = ${status}`;
        }
        
        // Execute count query to get total
        const countQuery = db
          .select({ count: sql`COUNT(DISTINCT ${applications.id})` })
          .from(applications)
          .leftJoin(users, eq(applications.userId, users.id))
          .where(conditionsSql);
          
        const countResult = await countQuery;
        const totalItems = Number(countResult[0].count);
        
        // Main query with joins, conditions, ordering and pagination
        const query = db
          .select({
            application: applications,
            user: {
              id: users.id,
              firstname: users.firstname,
              lastname: users.lastname,
              email: users.email
            }
          })
          .from(applications)
          .leftJoin(users, eq(applications.userId, users.id))
          .where(conditionsSql)
          .orderBy(orderDirection === 'asc' 
            ? asc(applications[orderBy as keyof typeof applications] as any)
            : desc(applications[orderBy as keyof typeof applications] as any))
          .limit(limit)
          .offset((page - 1) * limit);
        
        // Execute main query
        const results = await query;
        
        // Format the results to match the expected structure in the UI
        const formattedResults = results.map((item: any) => ({
          id: `APP-${item.application.id.toString().padStart(4, '0')}`,
          name: `${item.user?.firstname || ''} ${item.user?.lastname || ''}`.trim() || 'Unknown',
          amount: `R${parseFloat(item.application.loanAmount.toString()).toLocaleString('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          term: `${item.application.loanTermMonths} months`,
          purpose: item.application.purpose || 'Not specified',
          status: item.application.status.charAt(0).toUpperCase() + item.application.status.slice(1),
          date: new Date(item.application.applicationDate).toLocaleDateString('en-ZA', {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
          }),
          interestRate: `${item.application.interestRate}%`,
          userId: item.application.userId,
          raw: {
            ...item.application,
            user: item.user
          }
        }));
        
        // Return the data with pagination information
        return NextResponse.json({
          success: true,
          data: formattedResults,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching applications with pagination:', error);
        return NextResponse.json(
          { success: false, message: 'Error fetching applications', error: String(error) },
          { status: 500 }
        );
      }
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/crud-users/read-applications:', error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch applications',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 