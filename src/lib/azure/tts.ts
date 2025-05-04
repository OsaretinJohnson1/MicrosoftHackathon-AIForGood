import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Initialize speech config
const getSpeechConfig = () => {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech credentials not configured');
  }
  return sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );
};

// Language code mapping
const languageMap: Record<string, string> = {
  'xh': 'xh-ZA', // isiXhosa
  'zu': 'zu-ZA', // isiZulu
  'st': 'st-ZA', // Sesotho
  'en': 'en-US', // English
};

export type TTSLanguage = keyof typeof languageMap;

export async function textToSpeech(text: string, language: TTSLanguage = 'en'): Promise<ArrayBuffer> {
  if (!text) throw new Error('Text is required');
  
  const speechConfig = getSpeechConfig();
  const languageCode = languageMap[language] || 'en-US';
  speechConfig.speechSynthesisLanguage = languageCode;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(result.audioData);
        } else {
          reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}