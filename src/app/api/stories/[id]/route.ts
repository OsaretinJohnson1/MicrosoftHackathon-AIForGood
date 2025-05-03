import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { stories, users, languages, culturalTags, storyTags } from "@/database/AI-For-Good/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = parseInt(params.id);
    
    // Validate ID
    if (isNaN(storyId)) {
      return NextResponse.json({ error: "Invalid story ID" }, { status: 400 });
    }
    
    // Get the story with author and language details
    const story = await db.select({
      id: stories.id,
      title: stories.title,
      content: stories.originalContent,
      description: stories.description,
      audioUrl: stories.audioRecordingUrl,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      views: stories.views,
      userId: stories.userId,
      authorName: sql`CONCAT(${users.firstname}, ' ', ${users.lastname})`,
      authorEmail: users.email,
      languageId: stories.originalLanguageId,
      languageCode: languages.code,
      languageName: languages.name
    })
    .from(stories)
    .leftJoin(users, eq(stories.userId, users.id))
    .leftJoin(languages, eq(stories.originalLanguageId, languages.id))
    .where(eq(stories.id, storyId))
    .limit(1);
    
    // Check if story exists
    if (!story || story.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    
    // Get tags for this story
    const tags = await db.select({
      id: culturalTags.id,
      name: culturalTags.name,
      category: culturalTags.category
    })
    .from(culturalTags)
    .innerJoin(storyTags, eq(culturalTags.id, storyTags.tagId))
    .where(eq(storyTags.storyId, storyId));
    
    // Increment view count
    await db.update(stories)
      .set({ views: (story[0].views || 0) + 1 })
      .where(eq(stories.id, storyId));
    
    // Get available translations
    const translations = await db.select({
      languageId: languages.id,
      languageCode: languages.code,
      languageName: languages.name
    })
    .from(storyTranslations)
    .leftJoin(languages, eq(storyTranslations.languageId, languages.id))
    .where(eq(storyTranslations.storyId, storyId));
    
    // Get related comics
    const comics = await db.select({
      id: comics.id,
      title: comics.title,
      thumbnailUrl: comics.thumbnailUrl,
      status: comics.status,
      createdAt: comics.createdAt,
      panelCount: comics.panelCount
    })
    .from(comics)
    .where(eq(comics.storyId, storyId))
    .orderBy(desc(comics.createdAt));
    
    return NextResponse.json({
      ...story[0],
      tags,
      translations,
      comics
    });
    
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json({ 
      error: `Error fetching story: ${error instanceof Error ? error.message : String(error)}` 
 