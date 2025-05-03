export interface Panel {
    id: string
    imageUrl: string
    caption: string
  }
  
  export interface Comic {
    id: string
    title: string
    description?: string
    panels: Panel[]
    createdAt: string
    language?: string
    userId?: string
    characters?: string[]
  }
  
  export interface ComicScene {
    description: string
    caption: string
  }
  
  export interface TranscriptionResult {
    text: string
    language?: string
  }
  
  export interface TranslationResult {
    text: string
    detectedLanguage?: {
      language: string
      score: number
    }
  }
  