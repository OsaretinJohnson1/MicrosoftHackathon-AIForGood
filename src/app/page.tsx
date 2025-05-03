import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageSelector } from "@/components/LanguageSelector"
import { ArrowRight, BookOpen, Palette, Globe, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-800 opacity-90" />
        <div className="relative px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Culture to Comic</span>
              <span className="block text-purple-200 mt-2">Preserve Your Heritage</span>
            </h1>
            <p className="mt-6 text-xl text-white opacity-90 max-w-2xl mx-auto">
              Transform your cultural stories and experiences into beautiful, shareable comics using AI technology.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-6 text-lg bg-white text-purple-900 hover:bg-purple-100">
                  Get Started
                </Button>
              </Link>
              <Link href="/submit">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg text-white border-white hover:bg-white/10"
                >
                  Create Comic
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform uses cutting-edge AI to transform your cultural stories into visual narratives.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/5 border border-purple-100/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Story</h3>
              <p className="text-muted-foreground">
                Record your voice or type your cultural story, tradition, or experience.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-purple-100/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-purple-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Transformation</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your story and generates comic panels with matching visuals.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-purple-100/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Translate & Share</h3>
              <p className="text-muted-foreground">
                Translate your comic into multiple languages and share with friends and family.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-purple-100/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preserve Culture</h3>
              <p className="text-muted-foreground">
                Help preserve cultural heritage by creating visual stories for future generations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Comics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-purple-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Featured Comics</h2>
            <Link href="/comics" className="text-purple-600 hover:text-purple-800 flex items-center">
              View all comics <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id) => (
              <Link key={id} href={`/comic/${id}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative bg-muted">
                    <img
                      src={`/placeholder.svg?height=400&width=300&text=Comic ${id}`}
                      alt={`Featured comic ${id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">Cultural Journey #{id}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      A beautiful story about traditions, family, and cultural heritage.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to share your story?</h2>
          <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">
            Join our community and help preserve cultural heritage through visual storytelling.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 bg-white text-purple-900 hover:bg-purple-100">
                Sign Up Now
              </Button>
            </Link>
            <div className="flex items-center">
              <span className="mr-2">Choose language:</span>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
