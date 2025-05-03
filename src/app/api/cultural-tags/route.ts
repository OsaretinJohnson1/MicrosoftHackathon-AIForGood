import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { culturalTags } from "@/database/AI-For-Good/schema";
import { eq, like } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET endpoint to list cultural tags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    // Build query
    let query = db.select({
      id: culturalTags.id,
      name: culturalTags.name,
      description: culturalTags.description,
      category: culturalTags.category
    }).from(culturalTags);
    
    // Apply filters
    if (category) {
      query = query.where(eq(culturalTags.category, category));
    }
    
    if (search) {
      query = query.where(like(culturalTags.name, `%${search}%`));
    }
    
    // Get results
    const tags = await query;
    
    return NextResponse.json(tags);
    
  } catch (error) {
    console.error("Error fetching cultural tags:", error);
    return NextResponse.json({ 
      error: `Error fetching tags: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}

// POST endpoint to create a new cultural tag (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get session to check admin status
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { name, description, category } = await request.json();
    
    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }
    
    // Check if tag already exists
    const existingTag = await db.select({ id: culturalTags.id })
      .from(culturalTags)
      .where(eq(culturalTags.name, name))
      .limit(1);
    
    if (existingTag && existingTag.length > 0) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }
    
    // Create the tag
    const [newTag] = await db.insert(culturalTags)
      .values({
        name,
        description: description || null,
        category: category || null,
        createdAt: new Date().toISOString()
      })
      .returning({
        id: culturalTags.id,
        name: culturalTags.name,
        description: culturalTags.description,
        category: culturalTags.category
      });
    
    return NextResponse.json(newTag, { status: 201 });
    
  } catch (error) {
    console.error("Error creating cultural tag:", error);
    return NextResponse.json({ 
      error: `Error creating tag: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a cultural tag (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Get session to check admin status
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }
    
    // Delete the tag
    await db.delete(culturalTags)
      .where(eq(culturalTags.id, id));
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error deleting cultural tag:", error);
    return NextResponse.json({ 
      error: `Error deleting tag: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 