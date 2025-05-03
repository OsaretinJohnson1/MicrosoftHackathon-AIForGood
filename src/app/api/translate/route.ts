import { NextResponse } from 'next/server';

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh', // isiXhosa
  'zu': 'zu', // isiZulu
  'st': 'st', // Sesotho
  'en': 'en', // English
};

export async function POST(request: Request) {
  try {
    const { text, fromLanguage, toLanguage } = await request.json();

    if (!text || !fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: 'Text, fromLanguage, and toLanguage are required' },
        { status: 400 }
      );
    }

    // Validate language codes
    if (!languageMap[fromLanguage] || !languageMap[toLanguage]) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      );
    }

    // Azure Translator endpoint
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const location = process.env.AZURE_TRANSLATOR_REGION;

    const response = await fetch(`${endpoint}?api-version=3.0&from=${fromLanguage}&to=${toLanguage}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY || '',
        'Ocp-Apim-Subscription-Region': location || '',
        'Content-type': 'application/json',
      },
      body: JSON.stringify([{
        text: text
      }])
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The response format from Azure Translator is an array of translations
    const translatedText = data[0]?.translations[0]?.text;

    if (!translatedText) {
      throw new Error('No translation returned');
    }

    return NextResponse.json({
      translatedText,
      fromLanguage,
      toLanguage
    });

  } catch (error) {
    console.error('Translation Error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
