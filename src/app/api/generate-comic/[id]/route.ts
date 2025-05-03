import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // For now, since we don't have a database, we'll return a 404
    // In a real app, this would fetch from your database
    return NextResponse.json(
      { error: 'Comic not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching comic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comic' },
      { status: 500 }
    );
  }
} 