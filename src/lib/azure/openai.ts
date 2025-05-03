// // Helper module for Azure OpenAI service (GPT and DALL-E)
// import { OpenAIClient, AzureKeyCredential } from "@azure/openai"

// const openaiKey = process.env.AZURE_OPENAI_KEY || ""
// const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT || ""
// const gptDeployment = process.env.AZURE_OPENAI_GPT_DEPLOYMENT || "gpt-4"
// const dalleDeployment = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT || "dall-e-3"

// interface ComicScene {
//   description: string
//   caption: string
// }

// /**
//  * Generates comic scenes from a story using GPT
//  */
// export async function generateComicScenes(story: string, numScenes = 4): Promise<ComicScene[]> {
//   if (!openaiKey || !openaiEndpoint) {
//     throw new Error("Azure OpenAI configuration is missing")
//   }

//   const client = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiKey))

//   const prompt = `
//     Create ${numScenes} comic panel descriptions based on the following story. 
//     For each panel, provide:
//     1. A detailed visual description for generating an image
//     2. A short caption that will appear below the panel
    
//     Format the response as a JSON array of objects with 'description' and 'caption' fields.
    
//     Story: ${story}
//   `

//   const response = await client.getChatCompletions(
//     gptDeployment,
//     [
//       { role: "system", content: "You are a comic artist who creates visual narratives from stories." },
//       { role: "user", content: prompt },
//     ],
//     { temperature: 0.7, maxTokens: 2000 },
//   )

//   try {
//     // Parse the JSON response
//     const content = response.choices[0].message?.content || ""
//     const jsonMatch = content.match(/\[[\s\S]*\]/)

//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]) as ComicScene[]
//     } else {
//       throw new Error("Failed to parse GPT response as JSON")
//     }
//   } catch (error) {
//     console.error("Error parsing GPT response:", error)
//     throw new Error("Failed to generate comic scenes")
//   }
// }

// /**
//  * Generates an image for a comic panel using DALL-E
//  */
// export async function generateImages(description: string): Promise<ArrayBuffer> {
//   if (!openaiKey || !openaiEndpoint) {
//     throw new Error("Azure OpenAI configuration is missing")
//   }

//   const client = new OpenAIClient(openaiEndpoint, new AzureKeyCredential(openaiKey))

//   const prompt = `
//     Create a comic panel illustration with the following description:
//     ${description}
    
//     Style: Colorful comic book style with clear outlines and vibrant colors.
//     Make it culturally authentic and respectful.
//   `

//   const response = await client.getImages(dalleDeployment, prompt, {
//     n: 1,
//     size: "1024x1024",
//     responseFormat: "b64_json",
//   })

//   if (response.data && response.data.length > 0 && response.data[0].b64_json) {
//     // Convert base64 to ArrayBuffer
//     const base64 = response.data[0].b64_json
//     const binaryString = atob(base64)
//     const bytes = new Uint8Array(binaryString.length)

//     for (let i = 0; i < binaryString.length; i++) {
//       bytes[i] = binaryString.charCodeAt(i)
//     }

//     return bytes.buffer
//   } else {
//     throw new Error("Failed to generate image")
//   }
// }
