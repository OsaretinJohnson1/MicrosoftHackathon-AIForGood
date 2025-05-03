"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Trash2, Play, Pause } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void
  maxDuration?: number // in seconds
}

export function Recorder({ onRecordingComplete, maxDuration = 120 }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsPlaying(true)
      audioRef.current.onpause = () => setIsPlaying(false)
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [audioURL])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        onRecordingComplete(audioBlob)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const clearRecording = () => {
    setAudioURL(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = (recordingTime / maxDuration) * 100

  return (
    <Card className="p-4 border-purple-100 shadow-md">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex justify-center items-center h-12">
          {isRecording ? (
            <div className="flex flex-col w-full">
              <div className="text-xl font-mono text-purple-900 text-center mb-2">{formatTime(recordingTime)}</div>
              <Progress value={progressPercentage} className="h-2 bg-purple-100" indicatorStyle={{ backgroundColor: "rgb(126 34 206)" }} />
            </div>
          ) : audioURL ? (
            <div className="w-full">
              <audio ref={audioRef} src={audioURL} className="hidden" />
              <div className="flex items-center justify-between bg-purple-50 p-2 rounded-md">
                <Button variant="ghost" size="icon" onClick={togglePlayback} className="text-purple-700">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="text-sm font-medium text-purple-900">{formatTime(recordingTime)}</div>
                <Button variant="ghost" size="icon" onClick={clearRecording} className="text-purple-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Click record to start
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {isRecording ? (
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              disabled={!!audioURL}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800"
            >
              <Mic className="h-4 w-4" />
              {recordingTime > 0 ? "Record Again" : "Start Recording"}
            </Button>
          )}

          {audioURL && !isRecording && (
            <Button variant="outline" onClick={clearRecording}>
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">Maximum recording time: {formatTime(maxDuration)}</div>
      </div>
    </Card>
  )
}
