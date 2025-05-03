// // This is a helper module for Azure Speech services
// import {
//     SpeechConfig,
//     AudioConfig,
//     SpeechRecognizer,
//     ResultReason,
//     SpeechSynthesizer,
//   } from "microsoft-cognitiveservices-speech-sdk"
  
//   // Environment variables should be set in .env.local
//   const speechKey = process.env.AZURE_SPEECH_KEY || ""
//   const speechRegion = process.env.AZURE_SPEECH_REGION || "eastus"
  
//   /**
//    * Transcribes audio to text using Azure Speech-to-Text
//    */
//   export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
//     return new Promise((resolve, reject) => {
//       if (!speechKey) {
//         reject(new Error("Azure Speech key is not configured"))
//         return
//       }
  
//       const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion)
//       speechConfig.speechRecognitionLanguage = "en-US"
  
//       // Create audio config from the audio buffer
//       const pushStream = AudioConfig.createPushAudioInputStreamFromArrayBuffer(audioBuffer)
//       const audioConfig = AudioConfig.fromStreamInput(pushStream)
  
//       // Create speech recognizer
//       const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
  
//       recognizer.recognizeOnceAsync(
//         (result) => {
//           if (result.reason === ResultReason.RecognizedSpeech) {
//             resolve(result.text)
//           } else {
//             reject(new Error(`Speech recognition failed: ${result.reason}`))
//           }
//           recognizer.close()
//         },
//         (err) => {
//           reject(err)
//           recognizer.close()
//         },
//       )
//     })
//   }
  
//   /**
//    * Converts text to speech using Azure Text-to-Speech
//    */
//   export async function textToSpeech(
//     text: string,
//     voice = "en-US-JennyNeural",
//     language = "en-US",
//   ): Promise<ArrayBuffer> {
//     return new Promise((resolve, reject) => {
//       if (!speechKey) {
//         reject(new Error("Azure Speech key is not configured"))
//         return
//       }
  
//       const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion)
//       speechConfig.speechSynthesisLanguage = language
//       speechConfig.speechSynthesisVoiceName = voice
  
//       const synthesizer = new SpeechSynthesizer(speechConfig)
  
//       synthesizer.speakTextAsync(
//         text,
//         (result) => {
//           if (result.reason === ResultReason.SynthesizingAudioCompleted) {
//             resolve(result.audioData)
//           } else {
//             reject(new Error(`Speech synthesis failed: ${result.reason}`))
//           }
//           synthesizer.close()
//         },
//         (err) => {
//           reject(err)
//           synthesizer.close()
//         },
//       )
//     })
//   }
  