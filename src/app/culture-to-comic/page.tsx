// app/culture-to-comic/page.tsx
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Mic, MicOff, Send } from "lucide-react";
import { toast } from "sonner";

export default function CultureToComic() {
  const [story, setStory] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState("en");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = recorder;

      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          if (audioChunks.length === 0) {
            throw new Error("No audio data recorded");
          }

          const audioBlob = new Blob(audioChunks, {
            type: "audio/webm;codecs=opus",
          });

          // Check if the audio is long enough
          if (audioBlob.size < 1000) {
            throw new Error(
              "Recording too short. Please speak for at least 2 seconds."
            );
          }

          const formData = new FormData();
          formData.append("audio", audioBlob);
          formData.append("language", language);

          console.log("Sending audio for transcription:", {
            size: audioBlob.size,
            type: audioBlob.type,
            language: language,
          });

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Transcription failed");
          }

          const { text } = await response.json();
          if (!text) {
            throw new Error("No text returned from transcription");
          }

          console.log("Transcription successful:", text);
          setStory(text);
          toast.success(
            language === "en"
              ? "Voice transcribed successfully!"
              : language === "xh"
              ? "Ilizwi likhutshwe ngempumelelo!"
              : "Izwi likhutshwe ngempumelelo!"
          );
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error(
            error instanceof Error && error.message.includes("too short")
              ? language === "en"
                ? "Recording too short. Please speak for at least 2 seconds."
                : language === "xh"
                ? "Ukurekhoda kufutshane kakhulu. Nceda uthethe ixesha elingaphezulu kwesekhondi ezimbini."
                : "Ukurekhoda kufutshane kakhulu. Sicela ukhulume isikhathi esingaphezu kwesekhondi ezimbili."
              : language === "en"
              ? "Failed to transcribe voice. Please try again."
              : language === "xh"
              ? "Ayikwazanga ukukhutsha ilizwi. Nceda uphinde uzame."
              : "Ayikwazanga ukukhutsha izwi. Sicela uzame futhi."
          );
        } finally {
          // Stop all tracks in the stream
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      // Start recording with a 1-second timeslice
      recorder.start(1000);
      setIsRecording(true);
      toast.info(
        language === "en"
          ? "Recording started... Speak clearly into your microphone"
          : language === "xh"
          ? "Ukuqalisa ukurekhoda... Thetha ngokucacileyo kumayikrofoni yakho"
          : "Ukuqalisa ukurekhoda... Khuluma ngokucacile kumayikrofoni wakho"
      );
    } catch (error) {
      console.error("Recording error:", error);
      toast.error(
        language === "en"
          ? "Failed to access microphone. Please check your microphone permissions."
          : language === "xh"
          ? "Ayikwazanga ukufikelela kumayikrofoni. Nceda ujonge imvume yakho yomayikrofoni."
          : "Ayikwazanga ukufikelela kumayikrofoni. Sicela uhlole izimvume zakho zomayikrofoni."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(
        language === "en"
          ? "Processing recording..."
          : language === "xh"
          ? "Iyacoca ukurekhoda..."
          : "Iyacoca ukurekhoda..."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      toast.warning("Please enter or record a story");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/generate-comic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, language }),
      });

      if (!response.ok) throw new Error("Failed to generate comic");

      const comic = await response.json();
      router.push(
        `/comic/${comic.id}?data=${encodeURIComponent(JSON.stringify(comic))}`
      );
    } catch (error) {
      toast.error("Failed to create comic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        {language === "en"
          ? "Create Your Comic"
          : language === "xh"
          ? "Yenza Ikhomikhisi Yakho"
          : "Dala Ikhomikhisi Yakho"}
      </h1>

      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">
              {language === "en"
                ? "Select Language"
                : language === "xh"
                ? "Khetha Ulwimi"
                : "Khetha Ulimi"}
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="xh">isiXhosa</SelectItem>
                <SelectItem value="zu">isiZulu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={
              language === "en"
                ? "Tell your story here..."
                : language === "xh"
                ? "Balisela apha ibali lakho..."
                : "Landisa indaba yakho lapha..."
            }
            className="min-h-[200px]"
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSubmitting}
            >
              {isRecording ? (
                <MicOff className="mr-2" />
              ) : (
                <Mic className="mr-2" />
              )}
              {isRecording
                ? language === "en"
                  ? "Stop Recording"
                  : language === "xh"
                  ? "Yeka Ukurekhoda"
                  : "Yeka Ukurekhoda"
                : language === "en"
                ? "Record Voice"
                : language === "xh"
                ? "Rekhoda Ilizwi"
                : "Rekhoda Izwi"}
            </Button>

            <Button type="submit" disabled={!story || isSubmitting}>
              <Send className="mr-2" />
              {isSubmitting
                ? language === "en"
                  ? "Creating..."
                  : language === "xh"
                  ? "Iyenza..."
                  : "Iyakha..."
                : language === "en"
                ? "Create Comic"
                : language === "xh"
                ? "Yenza Ikhomikhisi"
                : "Dala Ikhomikhisi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
