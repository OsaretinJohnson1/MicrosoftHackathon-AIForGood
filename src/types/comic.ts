export interface Panel {
    id: string
    imageUrl: string
    caption: string
  }
  
  export interface Comic {
    id: string
    title: string
    description: string
    imageUrl: string
    author: Author
    category: string
    language: string
    region: string
    likes: number
    createdAt: string
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
  
  export interface Author {
    name: string
    avatar: string
  }
  