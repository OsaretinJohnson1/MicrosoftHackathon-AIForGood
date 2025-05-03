import { NextRequest, NextResponse } from "next/server";
import { seedDemoData } from "@/lib/seed-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Check for development mode or authentication
    if (process.env.NODE_ENV !== "development") {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.isAdmin) {
        return NextResponse.json({ 
          error: "Unauthorized. Seeding is only allowed in development mode or by admins." 
        }, { status: 403 });
      }
    }
    
    // Add a secret token check for additional security
    const { token } = await request.json();
    const seedToken = process.env.SEED_TOKEN || "demo-seed-token-for-hackathon";
    
    if (token !== seedToken) {
      return NextResponse.json({ 
        error: "Invalid seed token" 
      }, { status: 401 });
    }
    
    // Run seed operation
    await seedDemoData();
    
    return NextResponse.json({ 
      success: true,
      message: "Demo data seeded successfully" 
    });
    
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ 
      error: `Failed to seed data: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 