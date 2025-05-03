import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { comics, comicPanels, stories, audioNarrations, languages } from "@/database/AI-For-Good/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comicId = parseInt(params.id);
    
    // Validate ID
    if (isNaN(comicId)) {
      return NextResponse.json({ error: "Invalid comic ID" }, { status: 400 });
    }
    
    // Get the comic details
    const comic = await db.select({
      id: comics.id,
      title: comics.title,
      description: comics.description,
      storyId: comics.storyId,
      status: comics.status,
      thumbnailUrl: comics.thumbnailUrl,
      panelCount: comics.panelCount,
      views: comics.views,
      likes: comics.likes,
      shares: comics.shares,
      createdAt: comics.createdAt,
      updatedAt: comics.updatedAt
    })
    .from(comics)
    .where(eq(comics.id, comicId))
    .limit(1);
    
    // Check if comic exists
    if (!comic || comic.length === 0) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }
    
    // Only return complete comics
    if (comic[0].status !== "completed") {
      return NextResponse.json({ 
        error: "Comic generation is still in progress",
        status: comic[0].status
      }, { status: 202 });
    }
    
    // Get the panels in order
    const panels = await db.select({
      id: comicPanels.id,
      panelNumber: comicPanels.panelNumber,
      imageUrl: comicPanels.imageUrl,
      caption: comicPanels.caption,
      altText: comicPanels.altText
    })
    .from(comicPanels)
    .where(eq(comicPanels.comicId, comicId))
    .orderBy(asc(comicPanels.panelNumber));
    
    // Get available audio narrations
    const narrations = await db.select({
      id: audioNarrations.id,
      languageId: audioNarrations.languageId,
      audioUrl: audioNarrations.audioUrl,
      duration: audioNarrations.duration,
      languageCode: languages.code,
      languageName: languages.name
    })
    .from(audioNarrations)
    .leftJoin(languages, eq(audioNarrations.languageId, languages.id))
    .where(eq(audioNarrations.comicId, comicId));
    
    // Get original story info
    const story = await db.select({
      id: stories.id,
      title: stories.title
    })
    .from(stories)
    .where(eq(stories.id, comic[0].storyId))
    .limit(1);
    
    // Increment view count
    await db.update(comics)
      .set({ views: (comic[0].views || 0) + 1 })
      .where(eq(comics.id, comicId));
    
    return NextResponse.json({
      ...comic[0],
      panels,
      narrations,
      story: story[0] || null
    });
    
  } catch (error) {
    console.error("Error fetching comic:", error);
    return NextResponse.json({ 
      error: `Error fetching comic: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 