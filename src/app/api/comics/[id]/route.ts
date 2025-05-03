import { NextResponse } from 'next/server';
import type { Comic } from '@/types/comic';

// This is a mock database - in a real app, you'd use a proper database
const mockComics: Record<string, Comic> = {
  '1': {
    id: '1',
    title: 'The Spirit Lion',
    description: 'A young boy\'s journey through the Eastern Cape forest',
    panels: [
      {
        id: '1-1',
        imageUrl: '/placeholder.svg',
        caption: 'A young boy walks through the Eastern Cape forest...'
      },
      {
        id: '1-2',
        imageUrl: '/placeholder.svg',
        caption: 'He encounters a majestic spirit lion...'
      }
    ],
    createdAt: new Date().toISOString(),
    language: 'English'
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comic = mockComics[params.id];

    if (!comic) {
      return NextResponse.json(
        { error: 'Comic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comic);
  } catch (error) {
    console.error('Error fetching comic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comic' },
      { status: 500 }
    );
  }
} 