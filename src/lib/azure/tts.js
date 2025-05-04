const { SpeechConfig, SpeechSynthesizer } = require('@azure/cognitiveservices-speech-sdk');

const speechConfig = new SpeechConfig(process.env.AZURE_SPEECH_KEY);
speechConfig.speechSynthesisLanguage = process.env.AZURE_SPEECH_REGION;

const synthesizer = new SpeechSynthesizer(speechConfig);

const textToSpeech = async (text, language) => {
 try {
 const result = await synthesizer.speakTextAsync(text);
 return result.audioData;
 } catch (error) {
 console.error('TTS Error:', error);
 throw error;
 }
};

module.exports = { textToSpeech };