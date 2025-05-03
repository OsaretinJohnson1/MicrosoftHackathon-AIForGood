import { AzureOpenAI } from "openai";
import { AzureKeyCredential } from "@azure/core-auth";

// Types for comic generation
interface ComicPanel {
  description: string;
  caption: string;
  prompt?: string;
  imageData?: ArrayBuffer;
  altText?: string;
}

interface ComicScript {
  title: string;
  prompt: string;
  panels: ComicPanel[];
}

// OpenAI client setup
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_KEY || "";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01";

const client = new AzureOpenAI({
  apiKey,
  endpoint,
  apiVersion,
});

// GPT model deployment name
const deploymentName = process.env.AZURE_OPENAI_GPT_DEPLOYMENT || "gpt-4";
// DALL-E model deployment name
const imageDeploymentName = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT || "dall-e-3";

/**
 * Generate a comic script from a story text
 */
export async function generateComicScript(
  storyText: string,
  panelCount: number = 6,
  title: string = ""
): Promise<ComicScript> {
  try {
    // System prompt for comic script generation
    const systemPrompt = `You are an expert comic book artist and storyteller specializing in adapting traditional African folktales and stories into visual narratives. 
    Break down the provided story into exactly ${panelCount} sequential panels for a comic strip.
    
    For each panel, provide:
    1. A detailed visual description (what to show)
    2. A caption or narration text (what to tell)
    
    Focus on maintaining cultural authenticity, emotional impact, and visual storytelling. 
    Include important cultural elements, symbols, and visual motifs from the original story.`;

    // Get the response from GPT-4
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Story: ${storyText}\n\nTitle: ${title}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Parse the response content
    const content = response.choices[0]?.message?.content || "{}";
    const parsedContent = JSON.parse(content);

    // Transform the response into our expected format
    const panels: ComicPanel[] = [];
    
    if (Array.isArray(parsedContent.panels)) {
      for (const panel of parsedContent.panels) {
        panels.push({
          description: panel.visual || panel.description,
          caption: panel.caption || panel.narration || "",
          prompt: ""  // Will be filled later
        });
      }
    }

    return {
      title: parsedContent.title || title,
      prompt: systemPrompt,
      panels
    };
  } catch (error) {
    console.error("Error generating comic script:", error);
    throw new Error(`Failed to generate comic script: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate panel images for a comic using DALL-E
 */
export async function generateComicPanels(
  panels: ComicPanel[],
  comicId: number
): Promise<ComicPanel[]> {
  try {
    // Process each panel in sequence
    const updatedPanels: ComicPanel[] = [];
    
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      
      // Craft the prompt for DALL-E
      const dallePrompt = `Create a comic panel illustration for an African folktale: ${panel.description}
      Style: Clean, vibrant, authentic African art style with rich colors and cultural details.
      Panel number ${i + 1} of ${panels.length} for comic ID ${comicId}.`;
      
      // Generate the image
      const imageResponse = await client.images.generate({
        model: imageDeploymentName,
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      });
      
      // Extract the base64 image data
      if (!imageResponse.data || imageResponse.data.length === 0) {
        throw new Error(`Failed to generate image for panel ${i + 1}`);
      }
      
      const base64Image = imageResponse.data[0]?.b64_json;
      
      if (!base64Image) {
        throw new Error(`Failed to generate image for panel ${i + 1}`);
      }
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Image);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      
      // Update the panel with the image data and prompt
      updatedPanels.push({
        ...panel,
        imageData: bytes.buffer,
        prompt: dallePrompt
      });
    }
    
    return updatedPanels;
  } catch (error) {
    console.error("Error generating comic panels:", error);
    throw new Error(`Failed to generate comic panels: ${error instanceof Error ? error.message : String(error)}`);
  }
}
