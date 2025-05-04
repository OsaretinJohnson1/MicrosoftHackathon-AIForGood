"use client";

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
import { Loader2, Mic, Type, Globe, Info, LogOut } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv, fadeIn, staggerContainer } from "@/components/motion/motion"
import { PageTransition } from "@/components/motion/page-transition"


export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [progress, setProgress] = useState(0);

  const handleAudioRecorded = (blob: Blob) => {
    const file = new File([blob], "recording.webm", { type: "audio/webm" });
    setAudioFile(file);
  };

  const handleSubmit = async () => {
    if ((!story && !audioFile) || !title) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);

      if (activeTab === "text") {
        formData.append("story", story);
      } else if (audioFile) {
        formData.append("audio", audioFile);
      }

      const response = await fetch("/api/generate-comic", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate comic");

      const data = await response.json();
      router.push(`/comic/${data.id}`);
    } catch (error) {
      console.error("Error submitting story:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Simulate processing steps
    const steps = [
      "Analyzing your story...",
      "Creating scenes...",
      "Generating characters...",
      "Designing comic panels...",
      "Finalizing your comic...",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress((currentStep + 1) * (100 / steps.length));
        currentStep++;
      } else {
        clearInterval(interval);
        // Redirect to the comic view page
        router.push("/comic/1"); // In a real app, this would be a dynamic ID
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing tokens)
    router.push('/login')
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-purple-200/30 to-indigo-300/30 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-300/30 blur-3xl"></div>
          <div className="absolute top-[30%] left-[20%] w-[25%] h-[25%] rounded-full bg-gradient-to-tr from-pink-200/20 to-indigo-200/20 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.2, 0.1)}
            className="text-center mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="text-5xl font-bold text-purple-900 mb-4 tracking-tight"
            >
              Share Your Cultural Story
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-purple-700/70 max-w-2xl mx-auto font-light"
            >
              Transform your cultural experiences and traditions into beautiful
              comic panels using AI
            </motion.p>
          </MotionDiv>


          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <MotionDiv variants={fadeIn(0.3, 0.5)} className="md:col-span-8">
              <Card className="shadow-xl border-2 border-purple-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-2 border-b-2 border-purple-100/70">
                  <CardTitle className="text-2xl text-purple-950 flex items-center">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-block w-8 h-8 bg-purple-600 text-black rounded-full mr-3 flex items-center justify-center text-sm"
                    >
                    </motion.span>
                    Create a New Comic
                  </CardTitle>
                  <CardDescription className="text-purple-700/70 text-base pt-1">
                    Tell us about a cultural experience, tradition, or story from your heritage

                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="title" className="text-purple-800 font-medium">Story Title</Label>
                      <Input
                        id="title"
                        placeholder="Give your story a captivating title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-300 transition-all text-black"
                      />
                    </motion.div>


                    <Tabs defaultValue="text" onValueChange={setActiveTab} className="mt-4">
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-purple-500/80 to-indigo-500/80 rounded-lg border-2 border-purple-100">
                        <TabsTrigger 
                          value="text" 
                          className="!text-black font-medium flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-900 data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-purple-200 transition-all"

                        >
                          <Type className="h-4 w-4" />
                          Type Your Story
                        </TabsTrigger>

                        <TabsTrigger 
                          value="voice" 
                          className="!text-black !hover:text-gray-700 font-medium flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-900 data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-purple-200 transition-all"

                        >
                          <Mic className="h-4 w-4" />
                          Record Your Voice
                        </TabsTrigger>
                      </TabsList>
                      <AnimatePresence mode="wait">
                        {activeTab === "text" ? (

                          <TabsContent value="text" className="space-y-3 pt-6" key="text-tab">

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-2"
                            >
                              <Label htmlFor="story" className="text-purple-800 font-medium">Your Story</Label>
                              <Textarea
                                id="story"
                                placeholder="Share your cultural story or experience here... Be descriptive for the best comic results!"
                                className="min-h-[220px] border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-300 transition-all resize-none text-black"
                                value={story}
                                onChange={(e) => setStory(e.target.value)}
                              />
                            </motion.div>
                          </TabsContent>
                        ) : (

                          <TabsContent value="voice" className="pt-6" key="voice-tab">

                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-4"
                            >

                              <Label className="text-purple-800 font-medium">Record Your Story</Label>
                              <div className="bg-purple-50/70 rounded-lg p-4 border-2 border-purple-200 text-black">
                                <Recorder onRecordingComplete={handleAudioRecorded} />
                              </div>
                              <AnimatePresence>
                                {audioFile && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: 10, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-md border-2 border-green-200 shadow-sm"
                                  >
                                    <p className="text-sm font-medium text-purple-900 flex items-center">
                                      <span className="inline-block w-6 h-6 bg-green-500 text-black rounded-full mr-2 flex items-center justify-center text-xs">✓</span>
                                      Recording saved!
                                    </p>
                                    <p className="text-xs text-purple-700/70 ml-8">
                                      {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </motion.div>
                          </TabsContent>
                        )}
                      </AnimatePresence>
                    </Tabs>

                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center space-x-2 bg-indigo-50/70 p-3 rounded-lg border-2 border-indigo-200/70 shadow-sm hover:shadow-md hover:border-indigo-300/70 transition-all text-gray-900"
                    >
                      <Globe className="h-5 w-5 text-indigo-600" />
                      <Label htmlFor="language" className="whitespace-nowrap text-indigo-700 font-medium">
                        Translation Language:
                      </Label>
                      <LanguageSelector id="language" />
                    </motion.div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between py-5 border-t-2 border-purple-100/70 mt-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => router.back()}
                      className="border-2 border-purple-200 text-purple-700 hover:bg-purple-100/50 focus:text-purple-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:ring-offset-1 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || (!story && !audioFile) || !title}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-black shadow-md hover:shadow-lg transition-all duration-300 border-2 border-purple-700"

                    >
                      {isSubmitting ? (
                        <motion.div 
                          className="flex items-center" 
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </motion.div>
                      ) : (
                        <motion.span 
                          className="flex items-center text-black"
                          initial={{ opacity: 1 }}
                          whileHover={{ opacity: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="mr-1">Generate Comic</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </MotionDiv>

            <MotionDiv variants={fadeIn(0.5, 0.5)} className="space-y-6 md:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >

                <Card className="shadow-lg border-2 border-indigo-200/50 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-3 border-b-2 border-purple-100/50">
                    <CardTitle className="text-xl text-purple-950 flex items-center">
                      <span className="inline-block w-6 h-6 bg-indigo-600 text-black rounded-full mr-2 flex items-center justify-center text-xs">✨</span>

                      Tips for Great Comics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {[
                        "Be specific about visual details in your story",
                        "Include cultural elements like clothing, food, or traditions",
                        "Focus on a single experience or moment for best results",
                        "Speak clearly if recording your voice",
                      ].map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}

                          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 p-1.5 mt-0.5 shadow-sm border border-indigo-200">
                            <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>

                          </div>
                          <span className="text-purple-800">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="overflow-hidden rounded-xl"
              >

                <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md">
                  <Info className="h-4 w-4 text-indigo-700" />
                  <AlertTitle className="text-indigo-900 font-medium">Privacy Note</AlertTitle>
                  <AlertDescription className="text-sm text-indigo-700/70">
                    Your stories are processed securely. You can choose to make your comic private or public after
                    creation.

                  </AlertDescription>
                </Alert>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-xl overflow-hidden relative border-2 border-purple-400"
              >

                <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/cultural-pattern.svg')] opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="font-semibold text-black text-xl mb-3">Why Share Your Story?</h3>
                  <p className="text-black">
                    Cultural stories help preserve heritage and connect generations. Your comic could inspire others to
                    explore their own cultural roots.
                  </p>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center text-sm mt-3 text-black font-medium cursor-pointer"
                  >
                    Learn more about our mission 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </motion.div>
                </div>

              </motion.div>
            </MotionDiv>
          </div>

          <motion.div 
            className="text-center mt-12 text-purple-600/70 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p>Preserving cultural heritage through technology • Bringing stories to life</p>
          </motion.div>
        </div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="fixed bottom-16 left-6 z-20"
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="group flex items-center gap-2 bg-gray-500 border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-5 py-2"
          >
            <LogOut className="h-4 w-4 text-red-500 group-hover:text-purple-800 transition-all" />
            <span className="font-medium text-red-500">Logout</span>
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
