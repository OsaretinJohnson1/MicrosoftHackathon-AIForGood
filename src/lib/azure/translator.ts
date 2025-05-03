// Helper module for Azure Translator service
const translatorKey = process.env.AZURE_TRANSLATOR_KEY || ""
const translatorRegion = process.env.AZURE_TRANSLATOR_REGION || "global"
const translatorEndpoint = "https://api.cognitive.microsofttranslator.com"

/**
 * Translates text to the target language using Azure Translator
 */
export async function translateText(text: string, targetLanguage: string, sourceLanguage = "en"): Promise<string> {
  if (!translatorKey) {
    throw new Error("Azure Translator key is not configured")
  }

  const url = `${translatorEndpoint}/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": translatorKey,
      "Ocp-Apim-Subscription-Region": translatorRegion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ text }]),
  })

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data[0].translations[0].text
}
