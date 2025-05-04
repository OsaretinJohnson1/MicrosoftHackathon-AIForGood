import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('Azure OpenAI configuration is missing');
    }

    // Initialize OpenAI client for Azure
    const client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/mihla-ma8qzpjk-swedencentral.cognitiveservices.azure.com`,
      defaultQuery: { 'api-version': '2023-12-01-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
    });

    // Call DALL-E API with proper typing
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: `comic book style, ${prompt}, vibrant colors, clear lines, expressive characters, high quality, detailed, professional illustration`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    });

    // Proper type checking for the response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error('Invalid response format from DALL-E API');
    }

    const imageUrl = response.data[0].url;
    
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Image Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}