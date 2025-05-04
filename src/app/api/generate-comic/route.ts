import { NextResponse } from 'next/server';

import OpenAI from 'openai';

import Groq from 'groq-sdk';

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh', // isiXhosa
  'zu': 'zu', // isiZulu
  'st': 'st', // Sesotho
  'en': 'en', // English
};

async function translateText(text: string, fromLanguage: string, toLanguage: string) {
  if (fromLanguage === toLanguage) return text;

  const translatorKey = process.env.AZURE_TRANSLATOR_KEY;
  const translatorRegion = process.env.AZURE_TRANSLATOR_REGION;

  if (!translatorKey || !translatorRegion) {
    console.error('Missing Azure Translator credentials:', {
      hasKey: !!translatorKey,
      hasRegion: !!translatorRegion
    });
    throw new Error('Azure Translator credentials not configured');
  }

  const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';

  try {
    const response = await fetch(`${endpoint}?api-version=3.0&from=${fromLanguage}&to=${toLanguage}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': translatorKey,
        'Ocp-Apim-Subscription-Region': translatorRegion,
        'Content-type': 'application/json',
      },
      body: JSON.stringify([{
        text: text
      }])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data[0]?.translations[0]?.text || text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export async function POST(request: Request) {

 try {

 const { story, language } = await request.json();



// Validate language code

 if (!languageMap[language]) {

 return NextResponse.json(

 { error: 'Invalid language code' },

 { status: 400 }

 );

 }



// Initialize Groq client for text generation

 const groqClient = new Groq({

 apiKey: process.env.GROQ_API_KEY,

 });



 // Generate detailed panel instructions in the target language

 const textPrompt = `

 Create a detailed 4-panel comic strip based on this story: "${story}"

 For each panel, provide specific instructions in ${language === 'en' ? 'English' : language === 'xh' ? 'isiXhosa' : 'isiZulu'}:

 1. Panel 1: Opening scene

- What characters are present

- Their expressions and positions

- Background details

- No text or speech bubbles 

 2. Panel 2: Rising action

- What's happening in this scene

- Character actions and emotions

- Important visual elements

- No text or speech bubbles

 3. Panel 3: Climax

- The key moment of the story

- Character reactions

- Dramatic elements

- No text or speech bubbles

 4. Panel 4: Resolution

- How the story concludes

- Final character states

- Closing visual elements

- No text or speech bubbles

 Important: Write all instructions in ${language === 'en' ? 'English' : language === 'xh' ? 'isiXhosa' : 'isiZulu'}.

 `;



 const textResponse = await groqClient.chat.completions.create({

 messages: [{ role: "user", content: textPrompt }],

 model: "llama-3.3-70b-versatile",

 temperature: 0.7,

 });



 const content = textResponse.choices[0]?.message?.content;

 if (!content) {

 throw new Error('No content generated from Groq');

 }



 let panelInstructions = content;
 let englishPanelInstructions = content;



 // If not in English, translate the instructions for DALL-E
 if (language !== 'en') {
   console.log('Translating panel instructions to English for DALL-E');
   englishPanelInstructions = await translateText(panelInstructions, language, 'en');
   console.log('Translated instructions for DALL-E:', englishPanelInstructions);
 }



 // Initialize Azure client for image generation

 const azureClient = new OpenAI({

 apiKey: process.env.AZURE_OPENAI_API_KEY,

 baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,

 defaultQuery: { 'api-version': '2024-02-01' },

 defaultHeaders: {

 'api-key': process.env.AZURE_OPENAI_API_KEY,

 'Content-Type': 'application/json'

 },

 });



 // Generate image using Azure OpenAI with English instructions

 const imagePrompt = `

 Create a simple, child-friendly comic strip with 4 panels.

 Style Requirements:

 - Use a very simple, cartoon style

 - Soft, pastel colors

 - Clear, basic shapes

 - Minimal details

 - No text or speech bubbles

 - No complex backgrounds

 Layout:

 - 16:9 ratio (1792x1024)

 - 4 equal panels

 - Simple borders between panels

 Content Rules:

 - Only show simple, everyday scenes

 - Use basic character designs

 - Show only positive emotions

 - Keep all content extremely family-friendly

 - No cultural or religious elements

 - No specific locations or settings

 - No specific time periods

 - No specific cultural references

 Story Context (for reference only):

 ${language === 'en' ? story : await translateText(story, language, 'en')}

 Panel Instructions (simplified):

 ${englishPanelInstructions.split('\n')
   .filter(line => !line.includes('*') && !line.includes('**'))
   .map(line => line.replace(/[^a-zA-Z0-9\s.,!?-]/g, ''))
   .join('\n')}

 `;



 console.log('DALL-E Prompt:', imagePrompt);



 let imageUrl: string;

 try {

 const response = await azureClient.images.generate({

 model: "dall-e-3",

 prompt: imagePrompt,

 n: 1,

 size: "1792x1024",

 quality: "standard",

 style: "natural"

 });



 if (!response.data?.[0]?.url) {

 console.error('DALL-E Response:', response);

 throw new Error('No image URL returned');

 }

 imageUrl = response.data[0].url;
 console.log('Generated image URL:', imageUrl);

 // Verify the image URL is accessible
 const imageResponse = await fetch(imageUrl);
 if (!imageResponse.ok) {
   console.error('Image URL verification failed:', imageResponse.status, imageResponse.statusText);
   throw new Error('Generated image URL is not accessible');
 }

 } catch (azureError) {

 console.error('Azure DALL-E Error:', azureError);

 // Add more detailed error logging
 if (azureError instanceof Error) {
   console.error('Error details:', {
     message: azureError.message,
     name: azureError.name,
     stack: azureError.stack
   });
 }

 throw new Error(`Failed to generate image: ${azureError instanceof Error ? azureError.message : 'Unknown error'}`);

 }



 return NextResponse.json({

 id: Math.random().toString(36).substring(2, 15),

 comicUrl: imageUrl,

 story,

 language,

 dimensions: { width: 1792, height: 1024 },

 panelInstructions // Return the original language instructions for display

 });



 } catch (error) {

 console.error('Comic Generation Failed:', error);

 return NextResponse.json(

 {

 error: 'Comic generation failed',

 details: error instanceof Error ? error.message : 'Unknown error',

 suggestion: 'Check your API configurations'

 },

 { status: 500 }

 );

 }

}