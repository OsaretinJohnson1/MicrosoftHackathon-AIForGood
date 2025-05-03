// app/api/crud-users/read-user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../database/db';
import { applications, transactions, users } from '../../../../database/ubuntu-lend/schema';
import { eq, and, or, between, like, gt, lt, sql } from 'drizzle-orm';
import { getUserByField } from '../../../../lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if a specific user ID is requested
    const userId = searchParams.get('id');
    
    // If userId is provided, fetch a single user
    if (userId) {
      // If the ID has a "CUST-" prefix, extract the numeric part
      const idToSearch = userId.startsWith('CUST-') 
        ? Number(userId.replace('CUST-', '')) 
        : Number(userId);

      if (isNaN(idToSearch)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      // Fetch user data using the utility function
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
    } 
    
    // Otherwise, fetch all users with pagination and filtering
    else {
      // Get basic pagination parameters
      const page = Number(searchParams.get('page') || 1);
      const limit = Number(searchParams.get('limit') || 10);
      const offset = (page - 1) * limit;
      
      // Get sorting parameters
      const sortField = searchParams.get('sortField') || 'signupDate';
      const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
      
      // Map frontend sort fields to database columns
      const sortFieldMapping: Record<string, keyof typeof users> = {
        'id': 'id',
        'name': 'firstname', // Sort by firstname as fallback for name
        'email': 'email',
        'phone': 'phone',
        'status': 'delStatus',
        'signupDate': 'signupDate',
        // Default for any other field
        'default': 'signupDate'
      };
      
      // Get the actual database column to sort by
      const dbSortField = sortFieldMapping[sortField] || sortFieldMapping.default;
      console.log(`Sorting by field: ${sortField} (maps to DB column: ${dbSortField})`);
      
      // Get search and filter parameters
      const search = searchParams.get('search') || '';
      const userStatus = searchParams.get('userStatus') || '';
      const dateFrom = searchParams.get('dateFrom') || '';
      const dateTo = searchParams.get('dateTo') || '';
      const loanCountMin = searchParams.get('loanCountMin') ? parseInt(searchParams.get('loanCountMin') || '0') : null;
      const loanCountMax = searchParams.get('loanCountMax') ? parseInt(searchParams.get('loanCountMax') || '0') : null;
      const amountMin = searchParams.get('amountMin') ? parseFloat(searchParams.get('amountMin') || '0') : null;
      const amountMax = searchParams.get('amountMax') ? parseFloat(searchParams.get('amountMax') || '0') : null;
      
      // Log search and filter parameters for debugging
      console.log('Customers API search parameters:', {
        page, limit, offset, sortField, sortDirection,
        search: search ? `"${search}"` : 'none',
        status: userStatus ? `"${userStatus}"` : 'all',
        dateRange: dateFrom || dateTo ? `${dateFrom || 'any'} to ${dateTo || 'any'}` : 'none',
        loanCount: loanCountMin !== null || loanCountMax !== null ? `${loanCountMin || 'any'} to ${loanCountMax || 'any'}` : 'none',
        amountRange: amountMin !== null || amountMax !== null ? `${amountMin || 'any'} to ${amountMax || 'any'}` : 'none'
      });
      
      // Build the WHERE condition for the query
      let conditions = sql`1=1`; // Default TRUE condition
      
      // Apply search filter if provided
      if (search) {
        console.log('Searching for term:', search);
        conditions = sql`${conditions} AND (
          ${users.firstname} LIKE ${`%${search}%`} OR
          ${users.lastname} LIKE ${`%${search}%`} OR
          CONCAT(${users.firstname}, ' ', ${users.lastname}) LIKE ${`%${search}%`} OR
          ${users.email} LIKE ${`%${search}%`} OR
          ${users.phone} LIKE ${`%${search}%`}
        )`;
      }
      
      // Apply status filter if provided
      if (userStatus) {
        console.log('Filtering by status:', userStatus);
        
        try {
          // Make sure we log exactly what's happening with all fields involved
          console.log('User status fields in database:', {
            userStatus: 'userStatus field (0 = regular user, 1 = admin)',
            delStatus: 'delStatus field (0 = active, 1 = deleted)'
          });
          
          if (userStatus === 'Active') {
            // Active: Not deleted (delStatus = 0)
            conditions = sql`${conditions} AND ${users.delStatus} = 0`;
            console.log('Applied Active filter: delStatus = 0');
          } else if (userStatus === 'Inactive') {
            // Inactive users - as directed by user, ONLY use delStatus column
            // User clarified: Deleted users (delStatus = 1) are also considered inactive
            conditions = sql`${conditions} AND ${users.delStatus} = 1`;
            console.log('Applied Inactive filter: delStatus = 1 (same as deleted)');
          } else if (userStatus === 'Deleted') {
            // Deleted: delStatus = 1
            conditions = sql`${conditions} AND ${users.delStatus} = 1`;
            console.log('Applied Deleted filter: delStatus = 1');
          }
          
          // Log the SQL condition for debugging
          console.log('SQL condition after status filter:', conditions);
        } catch (filterError) {
          console.error('Error applying status filter:', filterError);
          // Default to showing all users if there's an error with the filter
          // Don't throw to avoid breaking the entire query
        }
      }
      
      // Prepare for loan count and amount filters
      const needsApplicationJoin = loanCountMin !== null || loanCountMax !== null || amountMin !== null || amountMax !== null;
      let userIdsWithLoanFilters: number[] = [];
      
      // If any loan-related filters are active, we need to prepare data first
      if (needsApplicationJoin) {
        // Create a query to get user IDs meeting loan criteria
        // const appConditions = sql`1=1`;
        
        if (loanCountMin !== null || loanCountMax !== null) {
          console.log('Filtering by loan count:', loanCountMin, 'to', loanCountMax);
          
          // First get the count of loans per user
          const loanCountQuery = db
            .select({
              userId: applications.userId,
              loanCount: sql`COUNT(*)`.as('loanCount')
            })
            .from(applications)
            .groupBy(applications.userId);
          
          const loanCounts = await loanCountQuery;
          
          // Filter by the loan count min and max
          userIdsWithLoanFilters = loanCounts
            .filter((item: { userId: number, loanCount: number | bigint }) => {
              const count = Number(item.loanCount);
              let matches = true;
              if (loanCountMin !== null) matches = matches && count >= loanCountMin;
              if (loanCountMax !== null) matches = matches && count <= loanCountMax;
              return matches;
            })
            .map((item: { userId: number, loanCount: number | bigint }) => item.userId);
          
          console.log(`Found ${userIdsWithLoanFilters.length} users matching loan count criteria`);
          
          // If we have specific user IDs, add them to our main conditions
          if (userIdsWithLoanFilters.length > 0) {
            try {
              console.log(`Adding ${userIdsWithLoanFilters.length} user IDs to IN clause`);
              conditions = sql`${conditions} AND ${users.id} IN (${sql.join(userIdsWithLoanFilters)})`;
            } catch (inClauseError) {
              console.error('Error creating IN clause for loan count filter:', inClauseError);
              // Instead of breaking, try a safer approach with limited IDs if there are too many
              if (userIdsWithLoanFilters.length > 500) {
                const limitedIds = userIdsWithLoanFilters.slice(0, 500);
                console.log(`Limiting to first 500 IDs out of ${userIdsWithLoanFilters.length}`);
                conditions = sql`${conditions} AND ${users.id} IN (${sql.join(limitedIds)})`;
              }
            }
          } else if (loanCountMin !== null || loanCountMax !== null) {
            // If we filtered and got no results, return empty result
            conditions = sql`${conditions} AND 0=1`; // Ensure no results
          }
        }
        
        // Handle amount filters
        if (amountMin !== null || amountMax !== null) {
          console.log('Filtering by total loan amount:', amountMin, 'to', amountMax);
          
          // Get the sum of loan amounts per user
          const loanAmountQuery = db
            .select({
              userId: applications.userId,
              totalAmount: sql`SUM(${applications.loanAmount})`.as('totalAmount')
            })
            .from(applications)
            .where(sql`${applications.status} <> 'rejected'`) // Exclude rejected loans
            .groupBy(applications.userId);
          
          const loanAmounts = await loanAmountQuery;
          
          // Filter by amount
          const userIdsWithAmountFilters = loanAmounts
            .filter((item: { userId: number, totalAmount: number | bigint }) => {
              const amount = Number(item.totalAmount);
              let matches = true;
              if (amountMin !== null) matches = matches && amount >= amountMin;
              if (amountMax !== null) matches = matches && amount <= amountMax;
              return matches;
            })
            .map((item: { userId: number, totalAmount: number | bigint }) => item.userId);
          
          console.log(`Found ${userIdsWithAmountFilters.length} users matching loan amount criteria`);
          
          // Combine with existing conditions
          if (userIdsWithAmountFilters.length > 0) {
            if (loanCountMin === null && loanCountMax === null) {
              // If no loan count filter active, add amount filter directly
              conditions = sql`${conditions} AND ${users.id} IN (${sql.join(userIdsWithAmountFilters)})`;
            } else {
              // If loan count filter is active, we need to intersect the ID lists
              userIdsWithLoanFilters = userIdsWithLoanFilters.filter(id => 
                userIdsWithAmountFilters.includes(id)
              );
              
              // Update the conditions with the intersected IDs
              conditions = sql`${conditions} AND ${users.id} IN (${sql.join(userIdsWithLoanFilters)})`;
            }
          } else if (amountMin !== null || amountMax !== null) {
            // If we filtered and got no results, return empty result
            conditions = sql`${conditions} AND 0=1`; // Ensure no results
          }
        }
      }
      
      // Apply date range filter if provided
      if (dateFrom) {
        console.log('Filtering from date:', dateFrom);
        conditions = sql`${conditions} AND ${users.signupDate} >= ${new Date(dateFrom).toISOString()}`;
      }
      
      if (dateTo) {
        console.log('Filtering to date:', dateTo);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of the day
        conditions = sql`${conditions} AND ${users.signupDate} <= ${toDate.toISOString()}`;
      }
      
      // Get the total count with filters applied
      const countQuery = db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(conditions);
      
      const countResult = await countQuery;
      const totalCount = Number(countResult[0].count);
      
      // For debugging: Let's fetch one user and log their fields to see what statuses look like
      if (totalCount > 0 && process.env.NODE_ENV !== 'production') {
        try {
          const sampleUser = await db.select().from(users).limit(1);
          if (sampleUser.length > 0) {
            console.log('Sample user status fields:', {
              id: sampleUser[0].id,
              delStatus: sampleUser[0].delStatus,
              userStatus: sampleUser[0].userStatus,
              activated: sampleUser[0].activated,
              verified: sampleUser[0].verified,
              isAdmin: sampleUser[0].isAdmin,
              status: sampleUser[0].status, // This field may not exist
              name: `${sampleUser[0].firstname} ${sampleUser[0].lastname}`
            });
          }
        } catch (err) {
          console.log('Error fetching sample user:', err);
        }
      }
      
      // Build and execute the main query
      let query;
      
      // Special handling for name sorting (needs to combine firstname and lastname)
      if (sortField === 'name') {
        query = db
          .select()
          .from(users)
          .where(conditions)
          .orderBy(
            sortDirection === 'asc'
              ? sql`CONCAT(${users.firstname}, ' ', ${users.lastname}) ASC`
              : sql`CONCAT(${users.firstname}, ' ', ${users.lastname}) DESC`
          )
          .limit(limit)
          .offset(offset);
      } else {
        // Normal sorting for other fields
        query = db
          .select()
          .from(users)
          .where(conditions)
          .orderBy(
            sortDirection === 'asc'
              ? sql`${users[dbSortField as keyof typeof users]} ASC`
              : sql`${users[dbSortField as keyof typeof users]} DESC`
          )
          .limit(limit)
          .offset(offset);
      }
      
      // Log the query for debugging
      console.log('Executing main query with:', {
        sortField,
        sortDirection,
        limit,
        offset
      });
      
      let results;
      try {
        results = await query;
      } catch (queryError) {
        console.error('Error executing main query:', queryError);
        
        // Try a simpler query as fallback
        console.log('Attempting fallback query without complex conditions');
        results = await db
          .select()
          .from(users)
          .limit(limit)
          .offset(offset);
      }
      
      // Return the data with pagination information
      return NextResponse.json({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    }
  } catch (error: unknown) {
    // Make sure we have access to searchParams
    const searchParams = request.nextUrl.searchParams;
    
    console.error('Error in GET /api/crud-users/read-user-data:', error);
    
    // Log the specific part of the query that might be causing issues
    console.error('Query parameters that might be causing this error:', {
      filters: {
        userStatus: searchParams.get('userStatus'),
        loanCountMin: searchParams.get('loanCountMin'),
        loanCountMax: searchParams.get('loanCountMax'),
        amountMin: searchParams.get('amountMin'),
        amountMax: searchParams.get('amountMax'),
        dateFrom: searchParams.get('dateFrom'),
        dateTo: searchParams.get('dateTo'),
        search: searchParams.get('search')
      }
    });
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
