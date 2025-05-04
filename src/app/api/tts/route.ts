import { NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { textToSpeech, TTSLanguage } from '@/lib/azure/tts';

export const runtime = 'edge';

// Azure Speech Service configuration
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY || '',
  process.env.AZURE_SPEECH_REGION || ''
);

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh-ZA', // isiXhosa
  'zu': 'zu-ZA', // isiZulu
  'st': 'st-ZA', // Sesotho
  'en': 'en-US', // English
};

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Set the language
    const languageCode = languageMap[language] || 'en-US';
    speechConfig.speechSynthesisLanguage = languageCode;

    // Create speech synthesizer
    const audioData = await textToSpeech(text, language as TTSLanguage);

    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert text to speech' },
      { status: 500 }
    );
  }
}



const ttsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { text, language } = req.body;
 
  try {
  // Set the language
  const languageCode = languageMap[language] || 'en-US';
 
  const audioData = await textToSpeech(text, languageCode);
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename="narration.mp3"`);
  res.send(audioData);
  } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Failed to generate TTS' });
  }
 };
 
 export default ttsHandler;
