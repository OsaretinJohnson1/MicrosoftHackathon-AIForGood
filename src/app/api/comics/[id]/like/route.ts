import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { comics, userFavorites } from "@/database/AI-For-Good/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const comicId = parseInt(params.id);
    
    // Validate ID
    if (isNaN(comicId)) {
      return NextResponse.json({ error: "Invalid comic ID" }, { status: 400 });
    }
    
    // Check if comic exists
    const comic = await db.select({ id: comics.id })
      .from(comics)
      .where(eq(comics.id, comicId))
      .limit(1);
    
    if (!comic || comic.length === 0) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }
    
    // Check if the user has already liked this comic
    const existingLike = await db.select({ id: userFavorites.id })
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.comicId, comicId)
        )
      )
      .limit(1);
    
    if (existingLike && existingLike.length > 0) {
      // User has already liked this comic - unlike it
      await db.delete(userFavorites)
        .where(eq(userFavorites.id, existingLike[0].id));
      
      // Decrement like count
      await db.update(comics)
        .set({ likes: sql`${comics.likes} - 1` })
        .where(eq(comics.id, comicId));
      
      return NextResponse.json({
        liked: false,
        message: "Comic unliked successfully"
      });
    } else {
      // Add the like
      await db.insert(userFavorites)
        .values({
          userId: userId,
          comicId: comicId,
          createdAt: new Date().toISOString()
        });
      
      // Increment like count
      await db.update(comics)
        .set({ likes: sql`${comics.likes} + 1` })
        .where(eq(comics.id, comicId));
      
      return NextResponse.json({
        liked: true,
        message: "Comic liked successfully"
      });
    }
    
  } catch (error) {
    console.error("Error liking comic:", error);
    return NextResponse.json({ 
      error: `Error liking comic: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 