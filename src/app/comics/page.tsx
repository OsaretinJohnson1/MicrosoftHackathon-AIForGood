"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Filter, ArrowUpDown, BookOpen, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv, fadeIn, staggerContainer } from "@/components/motion/motion"
import { PageTransition } from "@/components/motion/page-transition"
import { ComicCard } from "@/components/ComicCard"
import { LoadingAnimation } from "@/components/loading-animation"

// Mock data for demonstration
const MOCK_COMICS = Array.from({ length: 24 }, (_, i) => ({
  id: `comic-${i + 1}`,
  title: `Cultural Story ${i + 1}`,
  description: "A beautiful story about traditions, family, and cultural heritage.",
  imageUrl: `/placeholder.svg?height=400&width=300&text=Comic ${i + 1}`,
  author: {
    name: `Author ${(i % 5) + 1}`,
    avatar: `/placeholder.svg?height=40&width=40&text=A${(i % 5) + 1}`,
  },
  category: ["Family", "Tradition", "Heritage", "Celebration", "Food"][i % 5],
  language: ["English", "Spanish", "Chinese", "Hindi", "Arabic"][i % 5],
  region: ["Asia", "Europe", "Africa", "Americas", "Oceania"][i % 5],
  likes: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
}))

// Filter options
const CATEGORIES = ["All", "Family", "Tradition", "Heritage", "Celebration", "Food"]
const LANGUAGES = ["All", "English", "Spanish", "Chinese", "Hindi", "Arabic"]
const REGIONS = ["All", "Asia", "Europe", "Africa", "Americas", "Oceania"]
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
]

export default function BrowseComicsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLanguage, setSelectedLanguage] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [sortOption, setSortOption] = useState("recent")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filteredComics, setFilteredComics] = useState(MOCK_COMICS)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...MOCK_COMICS]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (comic) =>
          comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comic.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      result = result.filter((comic) => comic.category === selectedCategory)
    }

    // Apply language filter
    if (selectedLanguage !== "All") {
      result = result.filter((comic) => comic.language === selectedLanguage)
    }

    // Apply region filter
    if (selectedRegion !== "All") {
      result = result.filter((comic) => comic.region === selectedRegion)
    }

    // Apply sorting
    switch (sortOption) {
      case "recent":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        result.sort((a, b) => b.likes - a.likes)
        break
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
    }

    setFilteredComics(result)
  }, [searchQuery, selectedCategory, selectedLanguage, selectedRegion, sortOption])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you might update the URL with search params
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedLanguage("All")
    setSelectedRegion("All")
    setSortOption("recent")
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <MotionDiv initial="hidden" animate="visible" variants={staggerContainer(0.1, 0.1)} className="mb-10">
            <MotionDiv variants={fadeIn(0.1, 0.5)}>
              <h1 className="text-4xl font-bold text-green-900 mb-4">Browse Comics</h1>
            </MotionDiv>
            <MotionDiv variants={fadeIn(0.2, 0.5)}>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Explore cultural stories from around the world, transformed into beautiful comics by our community.
              </p>
            </MotionDiv>
          </MotionDiv>

          {/* Search and Filter Bar */}
          <MotionDiv variants={fadeIn(0.3, 0.5)} className="bg-white rounded-lg shadow-md p-4 mb-8 sticky top-20 z-30">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search comics by title or description..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex gap-2">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Category</Label>
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                          <TabsList className="grid grid-cols-3 h-auto">
                            {CATEGORIES.map((category) => (
                              <TabsTrigger key={category} value={category} className="text-xs py-1">
                                {category}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Region</Label>
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button variant="outline" onClick={resetFilters} className="text-sm">
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MotionDiv>

          {/* Results Stats */}
          <MotionDiv variants={fadeIn(0.4, 0.5)} className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-green-800">{filteredComics.length}</span> comics
              {selectedCategory !== "All" && (
                <>
                  {" "}
                  in{" "}
                  <Badge variant="outline" className="ml-1 font-normal">
                    {selectedCategory}
                  </Badge>
                </>
              )}
              {selectedLanguage !== "All" && (
                <>
                  {" "}
                  in{" "}
                  <Badge variant="outline" className="ml-1 font-normal">
                    {selectedLanguage}
                  </Badge>
                </>
              )}
              {selectedRegion !== "All" && (
                <>
                  {" "}
                  from{" "}
                  <Badge variant="outline" className="ml-1 font-normal">
                    {selectedRegion}
                  </Badge>
                </>
              )}
            </div>

            <Link href="/submit">
              <Button className="bg-amber-500 hover:bg-amber-400 text-green-900">Create Comic</Button>
            </Link>
          </MotionDiv>

          {/* Comics Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <LoadingAnimation />
                <p className="mt-4 text-muted-foreground">Loading comics...</p>
              </div>
            </div>
          ) : filteredComics.length > 0 ? (
            <MotionDiv
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.05, 0.1)}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredComics.map((comic, index) => (
                <MotionDiv key={comic.id} variants={fadeIn(0.1 * index, 0.5)} className="h-full">
                  <ComicCard comic={comic} />
                </MotionDiv>
              ))}
            </MotionDiv>
          ) : (
            <div className="text-center py-20 bg-green-50/50 rounded-lg">
              <BookOpen className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">No comics found</h3>
              <p className="text-muted-foreground mb-6">We couldn't find any comics matching your search criteria.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredComics.length > 0 && (
            <MotionDiv variants={fadeIn(0.6, 0.5)} className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline" className="bg-green-50">
                  1
                </Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <span className="mx-2">...</span>
                <Button variant="outline">Next</Button>
              </div>
            </MotionDiv>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
