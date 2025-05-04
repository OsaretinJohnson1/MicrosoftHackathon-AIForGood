import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});

export async function googleTextToSpeech(text: string, language: string): Promise<Uint8Array> {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: language, name: 'en-US-Wavenet-C' },
    audioConfig: { audioEncoding: 'LINEAR16' },
  });

  if (!response.audioContent || typeof response.audioContent === 'string') {
    throw new Error('No audio content received');
  }

  return response.audioContent;
}