"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Recorder } from "@/components/Recorder"
import { LanguageSelector } from "@/components/LanguageSelector"
import { Loader2, Mic, Type, Globe, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubmitPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("text")

  const handleAudioRecorded = (blob: Blob) => {
    const file = new File([blob], "recording.webm", { type: "audio/webm" })
    setAudioFile(file)
  }

  const handleSubmit = async () => {
    if ((!story && !audioFile) || !title) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)

      if (activeTab === "text") {
        formData.append("story", story)
      } else if (audioFile) {
        formData.append("audio", audioFile)
      }

      const response = await fetch("/api/generate-comic", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to generate comic")

      const data = await response.json()
      router.push(`/comic/${data.id}`)
    } catch (error) {
      console.error("Error submitting story:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-purple-900 mb-4">Share Your Cultural Story</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your cultural experiences and traditions into beautiful comic panels using AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Create a New Comic</CardTitle>
                <CardDescription>
                  Tell us about a cultural experience, tradition, or story from your heritage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your story a title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <Tabs defaultValue="text" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Type Your Story
                      </TabsTrigger>
                      <TabsTrigger value="voice" className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Record Your Voice
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="space-y-2 pt-4">
                      <Label htmlFor="story">Your Story</Label>
                      <Textarea
                        id="story"
                        placeholder="Share your cultural story or experience here..."
                        className="min-h-[200px]"
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="voice" className="pt-4">
                      <div className="space-y-4">
                        <Label>Record Your Story</Label>
                        <Recorder onRecordingComplete={handleAudioRecorded} />
                        {audioFile && (
                          <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                            <p className="text-sm font-medium text-purple-900">Recording saved!</p>
                            <p className="text-xs text-muted-foreground">
                              {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="language" className="whitespace-nowrap">
                      Translation Language:
                    </Label>
                    <LanguageSelector id="language" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!story && !audioFile) || !title}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Generate Comic"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Great Comics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <span className="text-purple-700 text-xs font-bold">1</span>
                    </div>
                    <span>Be specific about visual details in your story</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <span className="text-purple-700 text-xs font-bold">2</span>
                    </div>
                    <span>Include cultural elements like clothing, food, or traditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <span className="text-purple-700 text-xs font-bold">3</span>
                    </div>
                    <span>Focus on a single experience or moment for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <span className="text-purple-700 text-xs font-bold">4</span>
                    </div>
                    <span>Speak clearly if recording your voice</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Alert className="bg-purple-50 border-purple-200">
              <Info className="h-4 w-4 text-purple-700" />
              <AlertTitle className="text-purple-900">Privacy Note</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                Your stories are processed securely. You can choose to make your comic private or public after creation.
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-4 rounded-lg shadow-inner">
              <h3 className="font-semibold text-purple-900 mb-2">Why Share Your Story?</h3>
              <p className="text-sm text-purple-800">
                Cultural stories help preserve heritage and connect generations. Your comic could inspire others to
                explore their own cultural roots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
