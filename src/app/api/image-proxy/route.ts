// app/api/image-proxy/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    console.log('Proxying image from:', decodedUrl);
    
    // Add necessary headers for Azure Blob Storage
    const response = await fetch(decodedUrl, {
      headers: {
        'Referer': new URL(request.url).origin,
        'x-ms-version': '2020-10-02',
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      console.error('Image fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status
      });
    }

    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Log successful image proxy
    console.log('Successfully proxied image:', {
      type: imageBlob.type,
      size: imageBlob.size
    });

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': imageBlob.type,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Failed to proxy image', { status: 500 });
  }
}