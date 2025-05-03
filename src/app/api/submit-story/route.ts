import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { stories, culturalTags, storyTags } from "@/database/AI-For-Good/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { detectLanguage } from "@/lib/azure/translator";
import { uploadAudio } from "@/lib/azure/blob";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Check if this is a multipart form or JSON request
    let formData;
    let storyContent;
    let storyTitle;
    let storyDescription;
    let culturalTagIds: number[] = [];
    let audioFile: ArrayBuffer | null = null;
    let audioFileName: string | null = null;
    let detectedLanguageId: number | null = null;
    
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data (with file upload)
      formData = await request.formData();
      storyContent = formData.get("content") as string;
      storyTitle = formData.get("title") as string;
      storyDescription = formData.get("description") as string;
      culturalTagIds = JSON.parse(formData.get("culturalTagIds") as string || "[]");
      
      // Handle audio file if present
      const audio = formData.get("audio") as File;
      if (audio) {
        audioFile = await audio.arrayBuffer();
        audioFileName = `story-audio-${Date.now()}-${audio.name}`;
      }
    } else {
      // Handle JSON request
      const json = await request.json();
      storyContent = json.content;
      storyTitle = json.title;
      storyDescription = json.description || "";
      culturalTagIds = json.culturalTagIds || [];
    }
    
    // Validate required fields
    if (!storyContent || !storyTitle) {
      return NextResponse.json({ 
        error: "Story content and title are required" 
      }, { status: 400 });
    }
    
    // If audio was provided but no content, return error
    if (audioFile && !storyContent) {
      return NextResponse.json({ 
        error: "Story content is required even with audio submission" 
      }, { status: 400 });
    }
    
    // Detect the language of the content
    const languageCode = await detectLanguage(storyContent);
    
    // Get the language ID from the database
    const languageResult = await db.select({ id: languages.id })
      .from(languages)
      .where(eq(languages.code, languageCode))
      .limit(1);
    
    if (!languageResult || languageResult.length === 0) {
      // Create a new language entry if it doesn't exist
      const [newLanguage] = await db.insert(languages)
        .values({
          name: languageCode, // Use code as name initially
          code: languageCode,
          isActive: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning({ id: languages.id });
      
      detectedLanguageId = newLanguage.id;
    } else {
      detectedLanguageId = languageResult[0].id;
    }
    
    // Upload audio file if provided
    let audioUrl = null;
    if (audioFile && audioFileName) {
      audioUrl = await uploadAudio(audioFile, audioFileName);
    }
    
    // Insert the story
    const [newStory] = await db.insert(stories)
      .values({
        userId: userId,
        title: storyTitle,
        originalContent: storyContent,
        originalLanguageId: detectedLanguageId,
        audioRecordingUrl: audioUrl,
        description: storyDescription || "",
        location: "", // Can be updated later
        isPublic: 1, // Public by default
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning({ id: stories.id });
    
    // Add cultural tags if provided
    if (culturalTagIds && culturalTagIds.length > 0) {
      // Verify that the tags exist
      const existingTags = await db.select({ id: culturalTags.id })
        .from(culturalTags)
        .where(inArray(culturalTags.id, culturalTagIds));
      
      const validTagIds = existingTags.map(tag => tag.id);
      
      // Add story tags
      const storyTagValues = validTagIds.map(tagId => ({
        storyId: newStory.id,
        tagId: tagId,
        createdAt: new Date().toISOString()
      }));
      
      if (storyTagValues.length > 0) {
        await db.insert(storyTags).values(storyTagValues);
      }
    }
    
    return NextResponse.json({
      message: "Story submitted successfully",
      storyId: newStory.id,
      languageCode
    }, { status: 201 });
    
  } catch (error) {
    console.error("Story submission error:", error);
    return NextResponse.json({ 
      error: `Error submitting story: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}

// Helper to handle the SQL IN operator
function inArray(column: any, values: any[]) {
  return sql`${column} IN (${values.join(', ')})`;
} 