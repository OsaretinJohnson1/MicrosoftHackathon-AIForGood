import { NextRequest, NextResponse } from "next/server"
import { users } from "@/database/ubuntu-lend/schema"
import { auth } from "@/auth"
import { eq, like, or } from "drizzle-orm"
import { db } from "@/database/db"

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (session.user.isAdmin !== 1 && session.user.userStatus !== 1) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }
    
    // Get the search query from URL parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }
    
    // Check if query is a numeric ID
    if (/^\d+$/.test(query)) {
      // Search by ID
      const result = await db.select().from(users).where(eq(users.id, parseInt(query)))
      
      if (result.length > 0) {
        // Return the first user found
        return NextResponse.json({
          success: true,
          user: result[0]
        })
      }
    }
    
    // Search by email or phone
    const result = await db.select().from(users).where(
      or(
        like(users.email, `%${query}%`),
        like(users.phone, `%${query}%`)
      )
    ).limit(1)
    
    if (result.length > 0) {
      // Return the first user found
      return NextResponse.json({
        success: true,
        user: result[0]
      })
    }
    
    // No user found
    return NextResponse.json(
      { error: "No user found with the provided information" },
      { status: 404 }
    )
    
  } catch (error) {
    console.error("User search error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 