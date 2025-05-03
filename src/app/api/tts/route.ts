import { NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

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
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    // Convert text to speech
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(result.audioData);
          } else {
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
          synthesizer.close();
        },
        (error) => {
          reject(error);
          synthesizer.close();
        }
      );
    });

    // Return the audio data
    return new NextResponse(result as ArrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': (result as ArrayBuffer).byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert text to speech' },
      { status: 500 }
    );
  }
}
