import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/azure/translator";
import { db } from "@/database/db";
import { stories, storyTranslations, languages } from "@/database/AI-For-Good/schema";
import { eq, and } from "drizzle-orm";

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh', // isiXhosa
  'zu': 'zu', // isiZulu
  'st': 'st', // Sesotho
  'en': 'en', // English
};

// Azure Translator specific language codes
const azureLanguageMap: { [key: string]: string } = {
  'xh': 'xh', // isiXhosa
  'zu': 'zu', // isiZulu
  'st': 'st', // Sesotho
  'en': 'en', // English
};

export async function POST(request: Request) {
  try {
    const { text, fromLanguage, toLanguage } = await request.json();

    if (!text || !fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: 'Text, fromLanguage, and toLanguage are required' },
        { status: 400 }
      );
    }

    // Validate language codes
    if (!languageMap[fromLanguage] || !languageMap[toLanguage]) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      );
    }

    // Map to Azure Translator language codes
    const azureFromLanguage = azureLanguageMap[fromLanguage];
    const azureToLanguage = azureLanguageMap[toLanguage];

    // Azure Translator endpoint
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const location = process.env.AZURE_TRANSLATOR_REGION;
    const key = process.env.AZURE_TRANSLATOR_KEY;

    // Debug logging
    console.log('Translation request details:', {
      endpoint,
      fromLanguage,
      toLanguage,
      hasKey: !!key,
      hasRegion: !!location,
      region: location,
      requestBody: JSON.stringify([{ text }])
    });

    if (!key || !location) {
      return NextResponse.json(
        { error: 'Translation service not properly configured' },
        { status: 500 }
      );
    }

    const headers = {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
    };

    console.log('Request headers:', {
      ...headers,
      'Ocp-Apim-Subscription-Key': '***' // Hide the actual key in logs
    });

    const response = await fetch(`${endpoint}?api-version=3.0&from=${azureFromLanguage}&to=${azureToLanguage}`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{
        text: text
      }])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Validate required fields
    if (!storyId) {
      return NextResponse.json({ error: "Missing storyId parameter" }, { status: 400 });
    }
    
    if (!targetLanguageCode) {
      return NextResponse.json({ error: "Missing targetLanguageCode parameter" }, { status: 400 });
    }
    
    // Get target language ID from the database
    const targetLanguage = await db.select({
      id: languages.id,
      code: languages.code
    })
    .from(languages)
    .where(eq(languages.code, targetLanguageCode))
    .limit(1);
    
    if (!targetLanguage || targetLanguage.length === 0) {
      return NextResponse.json({ error: "Target language not supported" }, { status: 400 });
    }
    
    // Check if translation already exists
    const existingTranslation = await db.select({
      id: storyTranslations.id,
      translatedContent: storyTranslations.translatedContent
    })
    .from(storyTranslations)
    .where(
      and(
        eq(storyTranslations.storyId, storyId),
        eq(storyTranslations.languageId, targetLanguage[0].id)
      )
    )
    .limit(1);
    
    // If translation exists, return it
    if (existingTranslation && existingTranslation.length > 0) {
      return NextResponse.json({
        storyId,
        languageId: targetLanguage[0].id,
        translatedContent: existingTranslation[0].translatedContent,
        isExisting: true
      });
    }
    
    // Get the original story content
    const story = await db.select({
      content: stories.originalContent,
      languageId: stories.originalLanguageId
    })
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);
    
    if (!story || story.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    
    // Get source language code
    const sourceLanguage = await db.select({
      code: languages.code
    })
    .from(languages)
    .where(eq(languages.id, story[0].languageId))
    .limit(1);
    
    if (!sourceLanguage || sourceLanguage.length === 0) {
      return NextResponse.json({ error: "Source language not found" }, { status: 404 });
    }
    
    // Translate the content
    const translatedContent = await translateText(
      story[0].content,
      sourceLanguage[0].code,
      targetLanguageCode
    );
    
    // Save the translation to the database
    await db.insert(storyTranslations)
      .values({
        storyId: storyId,
        languageId: targetLanguage[0].id,
        translatedContent: translatedContent,
        translationType: "AI", // AI-generated translation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    
    return NextResponse.json({
      storyId,
      languageId: targetLanguage[0].id,
      translatedContent,
      isExisting: false
    });
    
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ 
      error: `Error translating content: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}
