import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { Comic } from '@/types/comic';

// Validate environment variable at startup
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// In-memory storage for generated comics with type safety
const generatedComics: Map<string, Comic> = new Map();
let comicCounter = 1;

// Type for the expected response from GROQ
type GroqResponse = {
  [key: string]: string | string[];
  characters: string[];
};

// Input validation type
type GenerateComicRequest = {
  story: string;
  language?: string;
};

// Supported languages
const SUPPORTED_LANGUAGES = ['English', 'Xhosa', 'Zulu', 'Sotho'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Helper function to validate input
function validateInput(data: unknown): data is GenerateComicRequest {
  return typeof data === 'object' && 
         data !== null && 
         'story' in data && 
         typeof (data as GenerateComicRequest).story === 'string';
}

export async function POST(req: Request) {
  try {
    const requestData = await req.json();

    // Validate input
    if (!validateInput(requestData)) {
      return NextResponse.json(
        { error: 'Invalid request format. Story (string) is required.' },
        { status: 400 }
      );
    }

    const { story, language = 'English' } = requestData;

    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
      return NextResponse.json(
        { 
          error: 'Invalid language', 
          supportedLanguages: SUPPORTED_LANGUAGES 
        },
        { status: 400 }
      );
    }

    // Generate the prompt
    const prompt = `Generate a scene-by-scene breakdown of the following story in ${language}. 
    Format the response as a JSON object with scenes and characters.
    Story: ${story}
    
    Required JSON format:
    {
      "scene_1": "Scene description...",
      "scene_2": "Scene description...",
      "characters": ["Character1", "Character2"]
    }`;

    // Call GROQ API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a creative storyteller who specializes in breaking down stories into vivid scenes. Provide detailed scene descriptions and identify key characters. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' } // Enforce JSON response
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response content from GROQ');
    }

    // Parse and validate the response
    let parsedResponse: GroqResponse;
    try {
      parsedResponse = JSON.parse(response);
      
      // Validate the response structure
      if (!parsedResponse.characters || !Array.isArray(parsedResponse.characters)) {
        throw new Error('Invalid response format: missing characters array');
      }

      const scenes = Object.entries(parsedResponse)
        .filter(([key]) => key.startsWith('scene_'))
        .sort(([a], [b]) => a.localeCompare(b));

      if (scenes.length === 0) {
        throw new Error('No scenes found in response');
      }
    } catch (parseError) {
      console.error('Invalid GROQ response:', response);
      throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Create new comic
    const comicId = comicCounter.toString();
    comicCounter++;

    const newComic: Comic = {
      id: comicId,
      title: `Generated Comic ${comicId}`,
      description: story.length > 100 ? `${story.substring(0, 97)}...` : story,
      panels: Object.entries(parsedResponse)
        .filter(([key]) => key.startsWith('scene_'))
        .sort(([a], [b]) => a.localeCompare(b)) // Ensure scenes are in order
        .map(([key, value], index) => ({
          id: `${comicId}-${index + 1}`,
          imageUrl: '/placeholder.svg',
          caption: value as string,
          order: index + 1
        })),
      characters: parsedResponse.characters,
      createdAt: new Date().toISOString(),
      language: language as SupportedLanguage
    };

    // Store the comic
    generatedComics.set(comicId, newComic);

    return NextResponse.json(newComic);
  } catch (error) {
    console.error('Error in generate-comic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate comic scenes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const comic = generatedComics.get(id);
      if (!comic) {
        return NextResponse.json(
          { error: 'Comic not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(comic);
    }

    // Return all comics sorted by creation date (newest first)
    const allComics = Array.from(generatedComics.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(allComics);
  } catch (error) {
    console.error('Error in GET comics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve comics' },
      { status: 500 }
    );
  }
}