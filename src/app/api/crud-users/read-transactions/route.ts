import { NextRequest, NextResponse } from 'next/server';
import { transactions, users, applications } from '../../../../database/ubuntu-lend/schema';
import { db } from '../../../../database/db';
import { eq, desc, asc, and, like, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if a specific transaction ID is requested
    const transactionId = searchParams.get('id');
    
    // If transactionId is provided, fetch a single transaction
    if (transactionId) {
      // If the ID has a "TRX-" prefix, use the transactionId field, otherwise use the id field
      let query;
      
      if (transactionId.startsWith('TRX-')) {
        query = db
          .select({
            transactions,
            user: {
              id: users.id,
              firstname: users.firstname,
              lastname: users.lastname,
              email: users.email
            },
            application: {
              id: applications.id,
              loanAmount: applications.loanAmount,
              status: applications.status
            }
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .leftJoin(applications, eq(transactions.applicationId, applications.id))
          .where(eq(transactions.transactionId, transactionId));
      } else {
        const id = parseInt(transactionId);
        if (isNaN(id)) {
          return NextResponse.json(
            { success: false, message: 'Invalid transaction ID format' },
            { status: 400 }
          );
        }
        
        query = db
          .select({
            transactions,
            user: {
              id: users.id,
              firstname: users.firstname,
              lastname: users.lastname,
              email: users.email
            },
            application: {
              id: applications.id,
              loanAmount: applications.loanAmount,
              status: applications.status
            }
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .leftJoin(applications, eq(transactions.applicationId, applications.id))
          .where(eq(transactions.id, id));
      }

      const result = await query;
      
      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Transaction not found' },
          { status: 404 }
        );
      }

      // Return the transaction data
      return NextResponse.json({
        success: true,
        data: result[0]
      });
    } 
    
    // Otherwise, fetch all transactions with filtering and pagination
    else {
      const page = Number(searchParams.get('page') || 1);
      const limit = Number(searchParams.get('limit') || 10);
      const orderBy = searchParams.get('orderBy') || 'id';
      const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';
      const search = searchParams.get('search') || '';
      const type = searchParams.get('type') || '';
      const status = searchParams.get('status') || '';
      
      // Build the conditions array for filtering
      const conditions = [];
      
      if (search) {
        conditions.push(
          sql`(${transactions.transactionId} LIKE ${`%${search}%`} OR ${transactions.reference} LIKE ${`%${search}%`})`
        );
      }
      
      if (type && type !== 'all') {
        conditions.push(eq(transactions.transactionType, type));
      }
      
      if (status && status !== 'all') {
        conditions.push(eq(transactions.status, status));
      }
      
      // Create the query with all possible conditions
      const baseQuery = db
        .select({
          transactions,
          user: {
            id: users.id,
            firstname: users.firstname,
            lastname: users.lastname
          },
          application: {
            id: applications.id,
            reference: applications.id // This will show as the reference (LOAN-XXXX)
          }
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .leftJoin(applications, eq(transactions.applicationId, applications.id));
      
      // Add conditions if there are any
      const whereQuery = conditions.length > 0
        ? baseQuery.where(and(...conditions))
        : baseQuery;
      
      // Add ordering
      const orderedQuery = orderDirection === 'asc'
        ? whereQuery.orderBy(asc(transactions[orderBy as keyof typeof transactions] as any))
        : whereQuery.orderBy(desc(transactions[orderBy as keyof typeof transactions] as any));
      
      // Add pagination
      const paginatedQuery = orderedQuery.limit(limit).offset((page - 1) * limit);
      
      // Execute count query to get total
      const countQuery = db.select({ count: sql`count(*)` }).from(transactions);
      
      if (conditions.length > 0) {
        countQuery.where(and(...conditions));
      }
      
      const [countResult, results] = await Promise.all([
        countQuery,
        paginatedQuery
      ]);
      
      const totalItems = Number(countResult[0].count);
      
      // Format the results to match the expected structure in the UI
      const formattedResults = results.map((item: any) => ({
        id: item.transactions.transactionId,
        customer: `${item.user?.firstname || ''} ${item.user?.lastname || ''}`.trim() || 'Unknown',
        type: item.transactions.transactionType,
        amount: `$${parseFloat(item.transactions.amount.toString()).toFixed(2)}`,
        status: item.transactions.status,
        date: new Date(item.transactions.transactionDate).toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        }),
        reference: `LOAN-${item.application?.id.toString().padStart(4, '0')}`,
        raw: {
          transactionId: item.transactions.id,
          userId: item.transactions.userId,
          applicationId: item.transactions.applicationId,
          transactionDate: item.transactions.transactionDate,
          balanceAfter: item.transactions.balanceAfter,
          description: item.transactions.description
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
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/crud-users/read-transactions:', error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch transactions',
        error: errorMessage,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 