import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { stories, users, languages, culturalTags, storyTags } from "@/database/AI-For-Good/schema";
import { eq, like, desc, and, SQL, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get("search");
    const languageCode = searchParams.get("language");
    const tagId = searchParams.get("tagId");
    const userId = searchParams.get("userId");
    
    // Base query for stories with username and language
    let query = db.select({
      id: stories.id,
      title: stories.title,
      description: stories.description,
      createdAt: stories.createdAt,
      views: stories.views,
      audioUrl: stories.audioRecordingUrl,
      isPublic: stories.isPublic,
      languageId: stories.originalLanguageId,
      languageCode: languages.code,
      userId: stories.userId,
      authorName: sql`CONCAT(${users.firstname}, ' ', ${users.lastname})`,
    })
    .from(stories)
    .leftJoin(users, eq(stories.userId, users.id))
    .leftJoin(languages, eq(stories.originalLanguageId, languages.id))
    .where(eq(stories.isPublic, 1)) // Only public stories
    .orderBy(desc(stories.createdAt))
    .limit(limit)
    .offset(offset);
    
    // Apply search filter if provided
    if (search) {
      query = query.where(like(stories.title, `%${search}%`));
    }
    
    // Filter by language
    if (languageCode) {
      query = query.where(eq(languages.code, languageCode));
    }
    
    // Filter by user
    if (userId) {
      query = query.where(eq(stories.userId, parseInt(userId)));
    }
    
    // Filter by tag (requires a join to storyTags)
    if (tagId) {
      query = query.innerJoin(
        storyTags, 
        and(
          eq(storyTags.storyId, stories.id),
          eq(storyTags.tagId, parseInt(tagId))
        )
      );
    }
    
    // Execute the query
    const storyResults = await query;
    
    // Count total (for pagination)
    const countQuery = db.select({ count: sql`COUNT(*)` })
      .from(stories)
      .where(eq(stories.isPublic, 1));
    
    if (search) {
      countQuery.where(like(stories.title, `%${search}%`));
    }
    
    if (languageCode) {
      countQuery.innerJoin(languages, eq(stories.originalLanguageId, languages.id))
        .where(eq(languages.code, languageCode));
    }
    
    if (userId) {
      countQuery.where(eq(stories.userId, parseInt(userId)));
    }
    
    if (tagId) {
      countQuery.innerJoin(
        storyTags, 
        and(
          eq(storyTags.storyId, stories.id),
          eq(storyTags.tagId, parseInt(tagId))
        )
      );
    }
    
    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;
    
    return NextResponse.json({
      stories: storyResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(Number(totalCount) / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json({ 
      error: `Error fetching stories: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 