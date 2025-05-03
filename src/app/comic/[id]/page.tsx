"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  MotionDiv,
  fadeIn,
  staggerContainer,
} from "@/components/motion/motion";
import { PageTransition } from "@/components/motion/page-transition";
import { toast } from "sonner";

interface Panel {
  id: string;
  imageUrl: string;
  caption: string;
}

interface Comic {
  id: string;
  panels: Panel[];
  language: string;
}

export default function ComicPage() {
  const params = useParams();
  const router = useRouter();
  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the comic data from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const comicData = searchParams.get("data");
    if (comicData) {
      try {
        setComic(JSON.parse(decodeURIComponent(comicData)));
        setLoading(false);
      } catch (error) {
        setError("Invalid comic data");
      }
    } else {
      // If no comic data in URL, redirect back to create page
      router.push("/culture-to-comic");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-700"></div>
        <p className="text-lg text-purple-700">Loading your comic...</p>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || "Comic not found"}</p>
          <Link href="/culture-to-comic">
            <Button>Create New Comic</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.1, 0.1)}
            className="mb-6 flex items-center justify-between"
          >
            <MotionDiv variants={fadeIn(0.1, 0.5)}>
              <Link href="/culture-to-comic">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Create
                </Button>
              </Link>
            </MotionDiv>

            <div className="flex items-center gap-4">
              <MotionDiv variants={fadeIn(0.2, 0.5)}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    toast.info("Download feature coming soon!");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </MotionDiv>
              <MotionDiv variants={fadeIn(0.3, 0.5)}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </MotionDiv>
              <MotionDiv variants={fadeIn(0.4, 0.5)}>
                <LanguageSelector />
              </MotionDiv>
            </div>
          </MotionDiv>

          <Card className="p-6 shadow-lg border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comic.panels.map((panel, index) => (
                <MotionDiv
                  key={panel.id}
                  variants={fadeIn(0.5 + index * 0.1, 0.5)}
                  className="relative aspect-square group"
                >
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                    <p className="text-sm text-white">{panel.caption}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
