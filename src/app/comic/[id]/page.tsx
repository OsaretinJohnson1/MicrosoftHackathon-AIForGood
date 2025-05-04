"use client";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function ComicPage() {
  const searchParams = useSearchParams();
  const comicData = searchParams.get("data");
  const [dimensions, setDimensions] = useState({ width: 1792, height: 1024 });

  const comic = comicData ? JSON.parse(decodeURIComponent(comicData)) : null;

  useEffect(() => {
    if (comic?.dimensions) {
      setDimensions(comic.dimensions);
    }
  }, [comic]);

  if (!comic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {comic?.language === "en"
            ? "Comic not found"
            : comic?.language === "xh"
            ? "Ikhomikhisi ayifumanekanga"
            : "Ikhomikhisi ayitholakalanga"}
        </h1>
        <Link href="/culture-to-comic">
          <Button>
            {comic?.language === "en"
              ? "Create New Comic"
              : comic?.language === "xh"
              ? "Yenza Ikhomikhisi Entsha"
              : "Dala Ikhomikhisi Entsha"}
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate responsive dimensions
  const aspectRatio = dimensions.width / dimensions.height;
  const maxWidth =
    typeof window !== "undefined" ? window.innerWidth * 0.9 : 800;
  const calculatedWidth = Math.min(maxWidth, dimensions.width);
  const calculatedHeight = calculatedWidth / aspectRatio;

  const handleDownload = async () => {
    try {
      const response = await fetch(comic.comicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comic-${comic.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(
        comic.language === "en"
          ? "Comic downloaded!"
          : comic.language === "xh"
          ? "Ikhomikhisi ikhutshelwe!"
          : "Ikhomikhisi ilandiwe!"
      );
    } catch (error) {
      toast.error(
        comic.language === "en"
          ? "Failed to download comic"
          : comic.language === "xh"
          ? "Ayikwazanga ukukhutshelwa"
          : "Ayikwazanga ukulandwa"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <Link href="/culture-to-comic">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {comic.language === "en"
              ? "Back"
              : comic.language === "xh"
              ? "Emva"
              : "Emuva"}
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success(
                comic.language === "en"
                  ? "Link copied!"
                  : comic.language === "xh"
                  ? "Ikhonkco ikopishiwe!"
                  : "Ikhonkco ikopishelwe!"
              );
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {comic.language === "en"
              ? "Share"
              : comic.language === "xh"
              ? "Yabelana"
              : "Yabelana"}
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {comic.language === "en"
              ? "Download"
              : comic.language === "xh"
              ? "Khuphela"
              : "Landela"}
          </Button>
        </div>
      </div>

      {/* Original Story */}
      <Card className="w-full max-w-4xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {comic.language === "en"
            ? "Original Story"
            : comic.language === "xh"
            ? "Ibali Lakho"
            : "Ibali elipheleleyo elenziwe yi-AI"}
        </h2>
        <p className="whitespace-pre-line">{comic.story}</p>
      </Card>

      {/* Comic Container */}
      <div className="w-full max-w-4xl bg-white p-4 mt-8 rounded-lg shadow-lg">
        <div className="comic-image-container overflow-hidden rounded-md border-2 border-gray-200">
          <img
            src={`/api/image-proxy?url=${encodeURIComponent(comic.comicUrl)}`}
            alt={comic.language === "en" ? "Comic strip" : "Ikhomikhisi"}
            className="w-full h-auto"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
            onError={(e) => {
              console.error("Error loading image:", e);
              toast.error(
                comic.language === "en"
                  ? "Failed to load image"
                  : comic.language === "xh"
                  ? "Ayikwazanga ukulayisha umfanekiso"
                  : "Ayikwazanga ukulayisha umfanekiso"
              );
            }}
            onLoad={() => {
              console.log("Image loaded successfully");
            }}
          />
        </div>
      </div>

      {/* Panel Instructions */}
      <Card className="w-full max-w-4xl mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">
          {comic.language === "en"
            ? "Panel Instructions"
            : comic.language === "xh"
            ? "Imiyalelo Yephaneli"
            : "Imiyalelo Yephaneli"}
        </h2>
        <div className="prose prose-purple max-w-none">
          <div
            className="font-sans text-sm"
            style={{ textAlign: "justify", textJustify: "inter-word" }}
          >
            {
              comic.panelInstructions
                .replace(/\*\*/g, "") // Remove double asterisks
                .replace(/\*/g, "") // Remove single asterisks
                .replace(/-/g, "") // Remove dashes
                .replace(/Iphaneli \d+: /g, "") // Remove "Iphaneli X: " from headings
                .replace(/### /g, "") // Remove markdown heading markers
                .replace(/\n\s*\n/g, "\n\n") // Normalize paragraph spacing
            }
          </div>
        </div>
      </Card>
    </div>
  );
}
