/**
 * Azure Translator Service utilities
 */

// Translator service configuration
const translatorEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
const translatorKey = process.env.AZURE_TRANSLATOR_KEY || "";
const translatorRegion = process.env.AZURE_TRANSLATOR_REGION || "";

/**
 * Translate text using Azure Translator
 * @param text Text to translate
 * @param fromLanguage Source language code (ISO 639-1)
 * @param toLanguage Target language code (ISO 639-1)
 * @returns Translated text
 */
export async function translateText(
  text: string,
  fromLanguage: string,
  toLanguage: string
): Promise<string> {
  try {
    // Endpoint URL
    const url = `${translatorEndpoint}/translate?api-version=3.0&from=${fromLanguage}&to=${toLanguage}`;
    
    // Request body
    const body = [{ text }];
    
    // Make the request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": translatorKey,
        "Ocp-Apim-Subscription-Region": translatorRegion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract the translated text
    if (!data || !data[0] || !data[0].translations || !data[0].translations[0]) {
      throw new Error("Invalid translation response structure");
    }
    
    return data[0].translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Detect the language of a text
 * @param text Text to analyze
 * @returns Detected language code
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    // Endpoint URL
    const url = `${translatorEndpoint}/detect?api-version=3.0`;
    
    // Request body
    const body = [{ text }];
    
    // Make the request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": translatorKey,
        "Ocp-Apim-Subscription-Region": translatorRegion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Language detection failed with status: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract the detected language
    if (!data || !data[0] || !data[0].language) {
      throw new Error("Invalid detection response structure");
    }
    
    return data[0].language;
  } catch (error) {
    console.error("Language detection error:", error);
    throw new Error(`Language detection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get supported languages from Azure Translator
 * @returns List of supported languages with codes and names
 */
export async function getSupportedLanguages(): Promise<any> {
  try {
    // Endpoint URL
    const url = `${translatorEndpoint}/languages?api-version=3.0&scope=translation`;
    
    // Make the request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": translatorKey,
        "Ocp-Apim-Subscription-Region": translatorRegion,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get supported languages: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Return the translation languages
    return data.translation;
  } catch (error) {
    console.error("Error getting supported languages:", error);
    throw new Error(`Failed to get supported languages: ${error instanceof Error ? error.message : String(error)}`);
  }
}
