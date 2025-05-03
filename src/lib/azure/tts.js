const { SpeechConfig, SpeechSynthesizer } = require('@azure/cognitiveservices-speech-sdk');

const speechConfig = new SpeechConfig('your-azure-speech-service-key');
const synthesizer = new SpeechSynthesizer(speechConfig);

const textToSpeech = async (text, language) => {
  const result = await synthesizer.speakTextAsync(text, language);
  return result.audioData;
};

module.exports = { textToSpeech };