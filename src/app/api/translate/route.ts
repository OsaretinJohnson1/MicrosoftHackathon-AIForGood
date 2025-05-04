import { NextResponse } from 'next/server';

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh', // isiXhosa
  'zu': 'zu', // isiZulu
  'st': 'st', // Sesotho
  'en': 'en', // English
};

// Azure Translator specific language codes
const azureLanguageMap: { [key: string]: string } = {
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

    // Map to Azure Translator language codes
    const azureFromLanguage = azureLanguageMap[fromLanguage];
    const azureToLanguage = azureLanguageMap[toLanguage];

    // Azure Translator endpoint
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const location = process.env.AZURE_TRANSLATOR_REGION;
    const key = process.env.AZURE_TRANSLATOR_KEY;

    // Debug logging
    console.log('Translation request details:', {
      endpoint,
      fromLanguage,
      toLanguage,
      hasKey: !!key,
      hasRegion: !!location,
      region: location,
      requestBody: JSON.stringify([{ text }])
    });

    if (!key || !location) {
      return NextResponse.json(
        { error: 'Translation service not properly configured' },
        { status: 500 }
      );
    }

    const headers = {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
    };

    console.log('Request headers:', {
      ...headers,
      'Ocp-Apim-Subscription-Key': '***' // Hide the actual key in logs
    });

    const response = await fetch(`${endpoint}?api-version=3.0&from=${azureFromLanguage}&to=${azureToLanguage}`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{
        text: text
      }])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
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
