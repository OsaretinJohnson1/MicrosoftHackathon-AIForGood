import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/azure/speech";
import { uploadAudio } from "@/lib/azure/blob";

// Language code mapping
const languageMap: { [key: string]: string } = {
  'xh': 'xh-ZA', // isiXhosa
  'zu': 'zu-ZA', // isiZulu
  'st': 'st-ZA', // Sesotho
  'en': 'en-US', // English
};

export async function POST(request: NextRequest) {
  try {
    // Using formData since we're expecting an audio file
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const languageCode = formData.get("languageCode") as string || "en-US";
    
    if (!audioFile) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }
    
    // Validate the file type
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json({ error: "File must be an audio file" }, { status: 400 });
    }
    
    // Convert the file to an ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // Save audio file to blob storage
    const fileName = `audio-${Date.now()}.wav`;
    const audioUrl = await uploadAudio(audioBuffer, fileName);
    
    // Transcribe the audio using Azure Speech services
    const transcription = await transcribeAudio(audioBuffer, languageCode);
    
    return NextResponse.json({
      transcription: transcription.text,
      confidence: transcription.confidence,
      audioUrl: audioUrl,
      language: languageCode
    });
    
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ 
      error: `Error transcribing audio: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}
