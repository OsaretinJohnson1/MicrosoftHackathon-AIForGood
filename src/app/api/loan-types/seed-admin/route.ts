import { NextRequest, NextResponse } from "next/server";
import { loanTypes } from "../../../../database/ubuntu-lend/schema";
import { db } from "../../../../database/db";
import { eq } from "drizzle-orm";

// Example loan types for seeding the database
const defaultLoanTypes = [
  {
    name: "Personal Loan",
    description: "General purpose loans for personal expenses, home improvements, or debt consolidation.",
    minAmount: "1000.00",
    maxAmount: "20000.00",
    minTermMonths: 3,
    maxTermMonths: 36,
    baseInterestRate: "15.50",
    processingFeePercent: "2.00",
    active: 1
  },
  {
    name: "Emergency Loan",
    description: "Short-term loans for unexpected expenses like medical bills or urgent repairs.",
    minAmount: "500.00",
    maxAmount: "10000.00",
    minTermMonths: 1,
    maxTermMonths: 12,
    baseInterestRate: "17.00",
    processingFeePercent: "2.50",
    active: 1
  },
  {
    name: "Business Loan",
    description: "Loans for starting or expanding a business, purchasing equipment, or managing cash flow.",
    minAmount: "5000.00",
    maxAmount: "50000.00",
    minTermMonths: 6,
    maxTermMonths: 60,
    baseInterestRate: "12.50",
    processingFeePercent: "1.75",
    active: 1
  },
  {
    name: "Education Loan",
    description: "Loans for tuition fees, educational materials, or other education-related expenses.",
    minAmount: "2000.00",
    maxAmount: "30000.00",
    minTermMonths: 12,
    maxTermMonths: 48,
    baseInterestRate: "10.00",
    processingFeePercent: "1.50",
    active: 1
  }
];

// GET endpoint to seed loan types without requiring authentication (for development)
export async function GET(request: NextRequest) {
  try {
    // For security: check if this is a development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, message: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }
    
    // Check if any loan types already exist
    const existingTypes = await db.select().from(loanTypes);
    
    if (existingTypes.length > 0) {
      // If loan types exist, return them
      return NextResponse.json({
        success: true,
        message: "Loan types already exist in the database",
        data: existingTypes
      });
    }

    // Insert default loan types
    const result = await db.insert(loanTypes).values(defaultLoanTypes);
    
    // Retrieve the inserted loan types to return them
    const insertedTypes = await db.select().from(loanTypes);
    
    return NextResponse.json({
      success: true,
      message: "Loan types seeded successfully",
      data: insertedTypes
    });
  } catch (error) {
    console.error("Error seeding loan types:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to seed loan types",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 