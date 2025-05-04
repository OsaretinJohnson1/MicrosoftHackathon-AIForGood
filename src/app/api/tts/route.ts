import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/azure/speech";
import { uploadAudio } from "@/lib/azure/blob";
import { db } from "@/database/db";
import { comics, audioNarrations, languages, storyTranslations, stories } from "@/database/AI-For-Good/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { comicId, languageCode } = await request.json();
    
    // Validate required fields
    if (!comicId) {
      return NextResponse.json({ error: "Missing comicId parameter" }, { status: 400 });
    }
    
    if (!languageCode) {
      return NextResponse.json({ error: "Missing languageCode parameter" }, { status: 400 });
    }
    
    // Get language ID from the database
    const language = await db.select({
      id: languages.id
    })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1);
    
    if (!language || language.length === 0) {
      return NextResponse.json({ error: "Language not supported" }, { status: 400 });
    }
    
    // Check if narration already exists
    const existingNarration = await db.select({
      id: audioNarrations.id,
      audioUrl: audioNarrations.audioUrl,
      duration: audioNarrations.duration
    })
    .from(audioNarrations)
    .where(
      and(
        eq(audioNarrations.comicId, comicId),
        eq(audioNarrations.languageId, language[0].id)
      )
    )
    .limit(1);
    
    // If narration exists, return it
    if (existingNarration && existingNarration.length > 0) {
      return NextResponse.json({
        audioUrl: existingNarration[0].audioUrl,
        duration: existingNarration[0].duration,
        isExisting: true
      });
    }
    
    // Get the comic and story IDs
    const comic = await db.select({
      storyId: comics.storyId
    })
    .from(comics)
    .where(eq(comics.id, comicId))
    .limit(1);
    
    if (!comic || comic.length === 0) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }
    
    // Get story content in the requested language
    let textToNarrate;
    
    // Try to get a translation first
    const translation = await db.select({
      translatedContent: storyTranslations.translatedContent
    })
    .from(storyTranslations)
    .where(
      and(
        eq(storyTranslations.storyId, comic[0].storyId),
        eq(storyTranslations.languageId, language[0].id)
      )
    )
    .limit(1);
    
    if (translation && translation.length > 0) {
      textToNarrate = translation[0].translatedContent;
    } else {
      // Use original content if no translation exists
      const originalStory = await db.select({
        content: stories.originalContent,
        languageId: stories.originalLanguageId
      })
      .from(stories)
      .where(eq(stories.id, comic[0].storyId))
      .limit(1);
      
      if (!originalStory || originalStory.length === 0) {
        return NextResponse.json({ error: "Story content not found" }, { status: 404 });
      }
      
      // Check if the original story is in the requested language
      if (originalStory[0].languageId !== language[0].id) {
        return NextResponse.json({ 
          error: "No translation available for the requested language",
          availableLanguageId: originalStory[0].languageId
        }, { status: 400 });
      }
      
      textToNarrate = originalStory[0].content;
    }
    
    // Generate speech audio from the text
    const speechAudio = await generateSpeech(textToNarrate, languageCode);
    
    // Upload the audio to blob storage
    const fileName = `narration-${comicId}-${languageCode}-${Date.now()}.mp3`;
    const audioUrl = await uploadAudio(speechAudio.audioData, fileName);
    
    // Save narration to database
    await db.insert(audioNarrations)
      .values({
        comicId: comicId,
        languageId: language[0].id,
        audioUrl: audioUrl,
        duration: speechAudio.duration,
        createdAt: new Date().toISOString()
      });
    
    return NextResponse.json({
      audioUrl: audioUrl,
      duration: speechAudio.duration,
      isExisting: false
    });
    
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json({ 
      error: `Error generating speech: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}
