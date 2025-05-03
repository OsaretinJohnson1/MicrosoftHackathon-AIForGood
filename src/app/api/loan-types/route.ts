import { NextRequest, NextResponse } from "next/server";
import { loanTypes } from "../../../database/ubuntu-lend/schema";
import { db } from "../../../database/db";
import { eq } from "drizzle-orm";

// GET endpoint to fetch all active loan types
export async function GET(request: NextRequest) {
  try {
    // Get all active loan types
    const activeLoanTypes = await db
      .select()
      .from(loanTypes)
      .where(eq(loanTypes.active, 1));
    
    return NextResponse.json({
      success: true,
      data: activeLoanTypes
    });
  } catch (error) {
    console.error("Error fetching loan types:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch loan types" },
      { status: 500 }
    );
  }
} 