import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { story, language } = await request.json();

    if (!story) {
      return NextResponse.json(
        { error: 'Story is required' },
        { status: 400 }
      );
    }

    // First, generate the comic panels using Groq
    const panelResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a creative assistant that helps create comic panels from stories. 
            Given a story in ${language}, create 4 comic panels with detailed descriptions for image generation.
            Each panel should have a caption that captures the essence of that moment in the story.
            
            IMPORTANT: You must respond with a valid JSON array containing exactly 4 panels.
            Each panel must have these exact fields:
            - id: a string (use numbers 1-4)
            - imagePrompt: a detailed description for image generation
            - caption: the caption text in the original language
            
            Example response format:
            {
              "panels": [
                {
                  "id": "1",
                  "imagePrompt": "A detailed description of the scene",
                  "caption": "The caption text"
                },
                {
                  "id": "2",
                  "imagePrompt": "Another scene description",
                  "caption": "Another caption"
                },
                {
                  "id": "3",
                  "imagePrompt": "Third scene description",
                  "caption": "Third caption"
                },
                {
                  "id": "4",
                  "imagePrompt": "Final scene description",
                  "caption": "Final caption"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: story
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!panelResponse.ok) {
      const errorData = await panelResponse.json().catch(() => ({}));
      console.error('Groq API Error:', errorData);
      
      // If we have a failed generation, try to parse it
      if (errorData.error?.failed_generation) {
        try {
          const failedContent = errorData.error.failed_generation;
          // Clean up the content to make it valid JSON
          const cleanedContent = failedContent
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Try to parse the cleaned content
          const parsedContent = JSON.parse(`[${cleanedContent}]`);
          
          if (Array.isArray(parsedContent) && parsedContent.length === 4) {
            // Use the parsed content as our panels
            const panelsWithImages = parsedContent.map((panel: any, index: number) => ({
              ...panel,
              imageUrl: `/placeholder.svg?height=400&width=400&text=Panel+${index + 1}&bg=purple-${(index + 1) * 100}`
            }));

            return NextResponse.json({
              id: Date.now().toString(),
              panels: panelsWithImages,
              language
            });
          }
        } catch (parseError) {
          console.error('Failed to parse error content:', parseError);
        }
      }
      
      throw new Error('Failed to generate comic panels');
    }

    let panelData;
    try {
      panelData = await panelResponse.json();
    } catch (error) {
      console.error('Failed to parse panel response:', error);
      throw new Error('Invalid response from comic generation service');
    }

    let panels;
    try {
      // Try to parse the content as JSON
      const content = panelData.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const parsedContent = JSON.parse(content);
      panels = parsedContent.panels || parsedContent;
      
      // Validate the panels structure
      if (!Array.isArray(panels) || panels.length !== 4) {
        throw new Error('Invalid panels format');
      }
      
      // Validate each panel has required fields
      panels.forEach((panel, index) => {
        if (!panel.id || !panel.imagePrompt || !panel.caption) {
          throw new Error(`Panel ${index + 1} missing required fields`);
        }
      });
    } catch (parseError) {
      console.error('Panel parsing error:', parseError);
      // Fallback to generating basic panels if parsing fails
      panels = [
        {
          id: "1",
          imagePrompt: "First scene from the story",
          caption: "The beginning of the story"
        },
        {
          id: "2",
          imagePrompt: "Second scene from the story",
          caption: "The story continues"
        },
        {
          id: "3",
          imagePrompt: "Third scene from the story",
          caption: "The story develops"
        },
        {
          id: "4",
          imagePrompt: "Final scene from the story",
          caption: "The story concludes"
        }
      ];
    }

    // Use placeholder images for now
    const panelsWithImages = panels.map((panel: any, index: number) => ({
      ...panel,
      // Using placeholder images with different colors for each panel
      imageUrl: `/placeholder.svg?height=400&width=400&text=Panel+${index + 1}&bg=purple-${(index + 1) * 100}`
    }));

    // Generate a unique ID for this comic
    const comicId = Date.now().toString();

    return NextResponse.json({
      id: comicId,
      panels: panelsWithImages,
      language
    });

  } catch (error) {
    console.error('Comic Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comic' },
      { status: 500 }
    );
  }
} 