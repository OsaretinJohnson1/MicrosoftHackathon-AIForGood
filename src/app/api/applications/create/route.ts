import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { applications, users } from '@/database/ubuntu-lend/schema';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';

// Define an interface for bank details
interface BankDetails {
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  accountName?: string;
  [key: string]: any; // Allow other properties
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login to continue.' },
        { status: 401 }
      );
    }
    
    // Get userId from session
    const userId = parseInt(session.user.id.toString());
    
    // Get the application data from request body
    const applicationData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'loanAmount',
      'loanTermMonths',
      'purpose',
      'loanTypeId',
      'employmentType',
      'paymentSchedule'
    ];
    
    const missingFields = requiredFields.filter(
      field => !applicationData[field] && applicationData[field] !== 0
    );
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Get user profile data to include in application
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }
    
    const user = userData[0];
    
    // Parse bank details from user profile
    let bankDetails: BankDetails = {};
    try {
      if (user.bankDetails) {
        bankDetails = JSON.parse(user.bankDetails) as BankDetails;
      }
    } catch (error) {
      console.error('Error parsing bank details:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid bank details in profile' },
        { status: 400 }
      );
    }
    
    // Calculate interest rate based on loan type (default 5%)
    const interestRate = 5.0; // Can be adjusted based on loan type
    
    // Calculate loan details
    const loanAmount = Number(applicationData.loanAmount);
    const loanTermMonths = Number(applicationData.loanTermMonths);
    
    // Calculate monthly payment using formula: P = L[i(1+i)^n]/[(1+i)^n-1]
    // Where: P = Monthly Payment, L = Loan Amount, i = Monthly Interest Rate, n = Number of Payments
    const monthlyInterestRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
      (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    
    const totalPayable = monthlyPayment * loanTermMonths;
    const totalInterest = totalPayable - loanAmount;
    
    // Create a future pay date (30 days from now)
    const payDate = new Date();
    payDate.setDate(payDate.getDate() + 30);
    
    // Create the application
    await db.insert(applications).values({
      userId: userId,
      loanAmount: loanAmount,
      loanTermMonths: loanTermMonths,
      interestRate: interestRate,
      loanTypeId: Number(applicationData.loanTypeId),
      purpose: applicationData.purpose,
      employer: user.employer || '',
      employmentType: applicationData.employmentType,
      accountNumber: bankDetails.accountNumber || '',
      accountName: bankDetails.accountName || '',
      accountType: bankDetails.accountType || '',
      bankName: bankDetails.bankName || '',
      payDate: payDate, // Set pay date to 30 days from now
      paymentSchedule: applicationData.paymentSchedule,
      applicationDate: new Date(),
      status: 'pending',
      // Calculated fields
      monthlyPayment: monthlyPayment,
      totalPayable: totalPayable,
      totalInterest: totalInterest
    });
    
    return NextResponse.json({
      success: true,
      message: 'Loan application submitted successfully'
    });
    
  } catch (error) {
    console.error('Error creating loan application:', error);
    return NextResponse.json(
      { success: false, message: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 