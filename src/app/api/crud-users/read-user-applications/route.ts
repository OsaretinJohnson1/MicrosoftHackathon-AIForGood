import { NextRequest, NextResponse } from "next/server";
import { applications, loanTypes } from "../../../../database/ubuntu-lend/schema";
import { db } from "../../../../database/db";
import { eq, and, sql } from "drizzle-orm";
import { auth } from '../../../../auth'; 

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized. Please login to continue."
      }, { status: 401 });
    }

    
    // Get userId from session
    const userId = parseInt(session.user.id.toString());
    
    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Get all applications for this user with pagination
    const userApplications = await db
      .select({
        application: applications,
        loanType: {
          name: loanTypes.name,
          description: loanTypes.description
        }
      })
      .from(applications)
      .leftJoin(loanTypes, eq(applications.loanTypeId, loanTypes.id))
      .where(eq(applications.userId, userId))
      .orderBy(applications.applicationDate)
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(eq(applications.userId, userId));
    
    return NextResponse.json({
      success: true,
      data: userApplications,
      pagination: {
        page,
        limit,
        totalCount: Number(totalCount[0].count),
        totalPages: Math.ceil(Number(totalCount[0].count) / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
} 