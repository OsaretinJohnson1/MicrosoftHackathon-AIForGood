import { NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh-ZA', // isiXhosa
  'zu': 'zu-ZA', // isiZulu
  'st': 'st-ZA', // Sesotho
  'en': 'en-US', // English
};

export async function POST(request: Request) {
  try {
    const { audioData, language } = await request.json();

    if (!audioData) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Validate language code
    const languageCode = languageMap[language] || 'en-US';

    // Create speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY || '',
      process.env.AZURE_SPEECH_REGION || ''
    );
    speechConfig.speechRecognitionLanguage = languageCode;

    // Convert base64 audio data to ArrayBuffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Create audio config from the buffer
    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);

    // Create speech recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Perform speech recognition
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else {
            reject(new Error(`Speech recognition failed: ${result.errorDetails}`));
          }
          recognizer.close();
        },
        (error) => {
          reject(error);
          recognizer.close();
        }
      );
    });

    return NextResponse.json({
      text: result,
      language: language
    });

  } catch (error) {
    console.error('Transcription Error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
