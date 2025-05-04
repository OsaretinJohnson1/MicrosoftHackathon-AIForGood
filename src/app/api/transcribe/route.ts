import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/azure/speech";
import { uploadAudio } from "@/lib/azure/blob";

const languageMap: { [key: string]: string } = {
  'xh': 'xh-ZA', // isiXhosa
  'zu': 'zu-ZA', // isiZulu
  'st': 'st-ZA', // Sesotho
  'en': 'en-US', // English
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio file too large (max 5MB)' },
        { status: 400 }
      );
    }

    if (!language || !languageMap[language]) {
      return NextResponse.json(
        { error: 'Valid language code is required' },
        { status: 400 }
      );
    }

    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      console.error('Azure credentials missing');
      return NextResponse.json(
        { error: 'Azure Speech Service credentials not configured' },
        { status: 500 }
      );
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = languageMap[language];

    const arrayBuffer = await audioFile.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty' },
        { status: 400 }
      );
    }

    // Create push stream with default format (will auto-detect common formats)
    const pushStream = sdk.AudioInputStream.createPushStream();
    
    // Write the audio data to the stream
    pushStream.write(arrayBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const result = await new Promise((resolve, reject) => {
      let finalText = '';
      let hasResult = false;

      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else {
            reject(new Error(`Recognition failed: ${result.reason}`));
          }
          recognizer.close();
        },
        (error) => {
          reject(new Error(`Recognition error: ${error}`));
          recognizer.close();
        }
      );
    });

    return NextResponse.json({
      transcription: transcription.text,
      confidence: transcription.confidence,
      audioUrl: audioUrl,
      language: languageCode
    });
    
  } catch (error) {
    console.error('Transcription Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.stack : undefined 
          : undefined
      },
      { status: 500 }
    );
  }
}