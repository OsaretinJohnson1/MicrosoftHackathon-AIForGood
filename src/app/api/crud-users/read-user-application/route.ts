import { NextRequest, NextResponse } from "next/server";
import { applications, loanTypes, transactions, users } from "@/database/ubuntu-lend/schema";
import { db } from "@/database/db";
import { eq, and, desc } from "drizzle-orm";
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to continue." },
        { status: 401 }
      );
    }
    
    // Get userId from session
    const userId = parseInt(session.user.id.toString());
    
    // Get application ID from URL
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get("id");
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch the application with loan type
    const applicationData = await db
      .select({
        application: applications,
        loanType: {
          id: loanTypes.id,
          name: loanTypes.name,
          description: loanTypes.description,
          baseInterestRate: loanTypes.baseInterestRate
        }
      })
      .from(applications)
      .leftJoin(loanTypes, eq(applications.loanTypeId, loanTypes.id))
      .where(
        and(
          eq(applications.id, parseInt(applicationId)),
          eq(applications.userId, userId) // Ensure the application belongs to the authenticated user
        )
      )
      .limit(1);
    
    if (!applicationData || applicationData.length === 0) {
      return NextResponse.json(
        { success: false, message: "Loan application not found or you don't have permission to view it" },
        { status: 404 }
      );
    }
    
    // Fetch related transactions
    const transactionHistory = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        amount: transactions.amount,
        transactionType: transactions.transactionType,
        status: transactions.status,
        transactionDate: transactions.transactionDate,
        paymentMethod: transactions.paymentMethod,
        reference: transactions.reference,
        description: transactions.description
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.applicationId, parseInt(applicationId)),
          eq(transactions.userId, userId)
        )
      )
      .orderBy(desc(transactions.transactionDate));
    
    // Get the user data (for reference)
    const userData = await db
      .select({
        firstname: users.firstname,
        lastname: users.lastname,
        phone: users.phone,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return NextResponse.json({
      success: true,
      data: {
        applicationData: applicationData[0],
        transactions: transactionHistory,
        user: userData[0]
      }
    });
    
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application details" },
      { status: 500 }
    );
  }
} 