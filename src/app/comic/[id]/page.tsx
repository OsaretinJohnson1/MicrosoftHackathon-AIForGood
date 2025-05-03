import { ComicViewer } from "@/components/ComicViewer";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionDiv } from "@/components/motion/motion";
import { fadeIn } from "@/lib/animations";
import type { Comic } from "@/types/comic";

async function getComic(id: string): Promise<Comic> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/comics/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch comic");
  }

  return res.json();
}

export default async function ComicPage({
  params,
}: {
  params: { id: string };
}) {
  const comic = await getComic(params.id);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={fadeIn(0.2, 0.5)}
            className="mb-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-900">
                  {comic.title}
                </CardTitle>
                {comic.description && (
                  <p className="text-muted-foreground mt-2">
                    {comic.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Language: {comic.language}</span>
                  <span>•</span>
                  <span>
                    Created: {new Date(comic.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          <ComicViewer panels={comic.panels} />
        </div>
      </div>
    </PageTransition>
  );
}
