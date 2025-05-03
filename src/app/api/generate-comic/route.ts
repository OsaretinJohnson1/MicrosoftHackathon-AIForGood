import { NextRequest, NextResponse } from "next/server";
import { generateComicScript } from "@/lib/azure/openai";
import { generateComicPanels } from "@/lib/azure/openai";
import { uploadImage } from "@/lib/azure/blob";
import { db } from "@/database/db";
import { comics, comicPanels, stories } from "@/database/AI-For-Good/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, title, description } = body;
    
    // Validate required fields
    if (!storyId) {
      return NextResponse.json({ error: "Missing storyId parameter" }, { status: 400 });
    }

    // Generate scenes using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SCENE_GENERATION_PROMPT
        },
        {
          role: 'user',
          content: story
        }
      ],
      model: 'llama-3.3-70b-versatile', // Using Mixtral model for high-quality output
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }
    
    // Generate a comic script/breakdown from the story using GPT-4
    const comicScript = await generateComicScript(
      story[0].content, 
      6, // Generate 6 panels by default
      story[0].title
    );
    
    // Create a new comic entry in the database
    const [newComic] = await db.insert(comics)
      .values({
        storyId: storyId,
        title: title || story[0].title,
        description: description || `Comic based on "${story[0].title}"`,
        panelCount: comicScript.panels.length,
        status: "processing",
        generationPrompt: comicScript.prompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning({ id: comics.id });
    
    // Start generating panels in the background and don't wait for completion
    generateComicPanels(comicScript.panels, newComic.id)
      .then(async (generatedPanels) => {
        // For each panel, upload the image and create a database entry
        const panelPromises = generatedPanels.map(async (panel, index) => {
          // Upload image to blob storage
          const imageUrl = await uploadImage(panel.imageData, `comic-${newComic.id}-panel-${index + 1}.png`);
          
          // Save panel to database
          return db.insert(comicPanels)
            .values({
              comicId: newComic.id,
              panelNumber: index + 1,
              imageUrl: imageUrl,
              caption: panel.caption,
              altText: panel.altText || panel.caption,
              promptUsed: panel.prompt,
              createdAt: new Date().toISOString(),
            });
        });
        
        await Promise.all(panelPromises);
        
        // Update comic status to completed
        await db.update(comics)
          .set({ 
            status: "completed",
            updatedAt: new Date().toISOString()
          })
          .where(eq(comics.id, newComic.id));
      })
      .catch(async (error) => {
        console.error("Error generating panels:", error);
        // Update comic status to failed
        await db.update(comics)
          .set({ 
            status: "failed",
            updatedAt: new Date().toISOString()
          })
          .where(eq(comics.id, newComic.id));
      });
    
    // Return the comic ID immediately without waiting for generation to complete
    return NextResponse.json({ 
      comicId: newComic.id,
      message: "Comic generation started",
      status: "processing"
    }, { status: 202 });
    
  } catch (error) {
    console.error("Error generating comic:", error);
    return NextResponse.json({ 
      error: `Error generating comic: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}
