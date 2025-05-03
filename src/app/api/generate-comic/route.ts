import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Scene generation prompt template
const SCENE_GENERATION_PROMPT = `You are a creative storyteller and comic artist. Break down the following story into vivid scenes and identify key characters. 
Focus on visual elements that would make compelling comic panels. Consider:
- Character expressions and poses
- Important actions and movements
- Key objects and settings
- Emotional moments
- Cultural elements and symbolism

Format the response as a JSON object with:
- scenes: Array of detailed scene descriptions
- characters: Array of character descriptions with their roles and visual characteristics
- cultural_elements: Array of important cultural references or symbols
- mood: Overall mood/tone of the story

Story: `;

export async function POST(request: Request) {
  try {
    const { story, language } = await request.json();

    if (!story) {
      return NextResponse.json(
        { error: 'Story text is required' },
        { status: 400 }
      );
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

    const comicStructure = JSON.parse(response);

    return NextResponse.json({
      ...comicStructure,
      original_language: language
    });

  } catch (error) {
    console.error('Comic Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comic structure' },
      { status: 500 }
    );
  }
}
