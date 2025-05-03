import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// Create a speech config from credentials
const speechSubscriptionKey = process.env.AZURE_SPEECH_KEY || "";
const speechRegion = process.env.AZURE_SPEECH_REGION || "";

// Speech support for African languages mapping
const languageVoiceMap: Record<string, { voiceName: string }> = {
  "en-US": { voiceName: "en-US-JennyNeural" },
  "en-NG": { voiceName: "en-NG-AbeoNeural" },     // English (Nigeria)
  "en-KE": { voiceName: "en-KE-AsiliaNeural" },   // English (Kenya)
  "fr-FR": { voiceName: "fr-FR-DeniseNeural" },   // French
  "ar-EG": { voiceName: "ar-EG-SalmaNeural" },    // Arabic (Egypt)
  "sw-KE": { voiceName: "sw-KE-ZuriNeural" },     // Swahili (Kenya)
  "af-ZA": { voiceName: "af-ZA-WillemNeural" },   // Afrikaans (South Africa)
  "zu-ZA": { voiceName: "zu-ZA-ThandoNeural" },   // Zulu (South Africa)
  "yo-NG": { voiceName: "yo-NG-BimpeNeural" },    // Yoruba (Nigeria) 
  // Add more language-voice pairs as they become available in Azure
};

/**
 * Transcribe audio to text using Azure Speech Services
 */
export async function transcribeAudio(
  audioData: ArrayBuffer,
  languageCode: string = "en-US"
): Promise<{ text: string; confidence: number }> {
  return new Promise((resolve, reject) => {
    try {
      // Create the speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speechSubscriptionKey,
        speechRegion
      );
      
      // Set recognition language
      speechConfig.speechRecognitionLanguage = languageCode;
      
      // Create an audio config using the ArrayBuffer
      const pushStream = sdk.AudioInputStream.createPushStream();
      
      // Convert ArrayBuffer to Uint8Array and push to the stream
      const audioArray = new Uint8Array(audioData);
      pushStream.write(audioArray);
      pushStream.close();
      
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
      
      // Create recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      
      // Start recognition
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve({
              text: result.text,
              confidence: result.properties.getProperty(
                sdk.PropertyId.SpeechServiceResponse_JsonResult
              )
                ? parseFloat(
                    JSON.parse(
                      result.properties.getProperty(
                        sdk.PropertyId.SpeechServiceResponse_JsonResult
                      )
                    ).NBest[0].Confidence
                  )
                : 0.0,
            });
          } else {
            reject(
              new Error(
                `Speech recognition failed: ${result.reason}, Details: ${result.errorDetails}`
              )
            );
          }
          
          // Close the recognizer
          recognizer.close();
        },
        (err) => {
          recognizer.close();
          reject(err);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate speech from text using Azure Text-to-Speech service
 */
export async function generateSpeech(
  text: string,
  languageCode: string = "en-US"
): Promise<{ audioData: ArrayBuffer; duration: number }> {
  return new Promise((resolve, reject) => {
    try {
      // Create speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speechSubscriptionKey,
        speechRegion
      );
      
      // Get voice for the language or use default
      const voice = languageVoiceMap[languageCode] 
        ? languageVoiceMap[languageCode].voiceName 
        : "en-US-JennyNeural";
      
      // Set synthesis voice
      speechConfig.speechSynthesisVoiceName = voice;
      
      // Create synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
      
      // Start synthesis
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Get duration from the result properties if available
            let duration = 0;
            try {
              const jsonProperty = result.properties.getProperty(
                sdk.PropertyId.SpeechServiceResponse_JsonResult
              );
              
              if (jsonProperty) {
                const jsonResult = JSON.parse(jsonProperty);
                duration = jsonResult.Duration ? jsonResult.Duration / 10000000 : 0; // Convert from 100-nanosecond units to seconds
              }
            } catch (e) {
              console.warn("Could not parse duration from speech result:", e);
              // Estimate duration based on text length (rough approximation)
              duration = text.length * 0.06; // ~60ms per character as fallback
            }
            
            resolve({
              audioData: result.audioData,
              duration: Math.round(duration)
            });
          } else {
            reject(
              new Error(
                `Speech synthesis failed: ${result.reason}, Details: ${result.errorDetails}`
              )
            );
          }
          
          // Close the synthesizer
          synthesizer.close();
        },
        (err) => {
          synthesizer.close();
          reject(err);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}
