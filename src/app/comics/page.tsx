"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Filter, ArrowUpDown, BookOpen, ChevronDown, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionDiv, fadeIn } from "@/components/motion/motion"
import { PageTransition } from "@/components/motion/page-transition"
import { LoadingAnimation } from "@/components/loading-animation"
import type { Comic } from "@/types/comic"
import { ComicLoader } from "@/components/ComicLoader"
import { Header } from "@/components/header"

// Generate mock data function
const generateMockComics = (startIndex: number, count: number) => {
  // Cultural content organized by the three groups
  const culturalContent = [
    // Zulu cultural content
    {
      images: [
        "/images/shaka-zulu.jpg", // Zulu traditional dress
        "/images/xhosa-houses.jpg", // Zulu dancing
        "/images/zulu-man.jpg", // Zulu beadwork
        "/images/zulu-dance.jpg", // Zulu shield
      ],
      titles: [
        "Ilifa likaShaka (Shaka's Legacy)",
        "Izindaba zaKwaZulu (Tales from KwaZulu)",
        "Umoya WeQhawe (Spirit of the Warrior)",
        "Amasiko amaZulu (Zulu Traditions)"
      ],
      descriptions: [
        "Ukuhlola umlando omangalisayo weNkosi uShaka kanye nomthelela wakhe kusiko lamaZulu.",
        "Izindaba zomndeni, amasiko kanye nomphakathi enhliziyweni yaKwaZulu-Natali.",
        "Ukugubha umoya weqhawe ochaza ubunjalo besiko lamaZulu.",
        "Uhambo oluhamba ngamasiko anothile kanye nemigubho yabantu abangamaZulu."
      ],
      language: "Zulu",
      region: "KwaZulu-Natal"
    },
    // Xhosa cultural content
    {
      images: [
        "/images/mandela.jpg", // Xhosa traditional patterns
        "/images/two-sisters.jpg", // Xhosa beadwork
        "/images/Xhosa_women.jpg", // Eastern Cape landscape
        "/images/xhosa-dolls.jpg", // Xhosa cultural event
      ],
      titles: [
        "Uhambo lika Madiba (Madiba's Journey)",
        "Umchokozo Wethu (Our Face Painting)",
        "Amabali oBulumko amaXhosa (Xhosa Wisdom Tales)",
        "Imizila yeMveli (Circle of Tradition)"
      ],
      descriptions: [
        "Ukulandela umkhondo kaNelson Mandela kunye nenkcubeko yakhe yamaXhosa.",
        "Oodade ababini, uAnelisa noAnele, bakhuphisana ngokwenza umzobo omhle kakhulu womchokozo wemibhiyozo.",
        "Ubulumko bamandulo obudluliselwe kumasizukulwana ngabalisa-zibali bamaXhosa.",
        "Kubhiyozelwa imizila esjikelezayo emele ubomi noluntu kwinkcubeko yamaXhosa."
      ],
      language: "Xhosa",
      region: "Eastern Cape"
    },
    // English South African content
    {
      images: [
        "/images/amasi.jpg", // Cape Town colorful houses
        "/images/xhosa-girl.jpg", // Vineyard landscape
        "/images/stickfight.jpeg", // Colonial architecture
        "/images/zulu-dance.jpg", // Cape landscape
      ],
      titles: [
        "The Amasi Adventure",
        "The Bead Challenge",
        "Stick Fighter's Day",
        "The Reed Dance Lesson"
      ],
      descriptions: [
        "A boy, Jabu, tries to impress his friends by sneaking amasi from his gran's kitchen, only to get caught.",
        "Thuli, a Xhosa girl, races to finish a beaded necklace for her aunt's wedding but loses a bead.",
        "Vusi watches his older brother compete in a Zulu stick-fighting match and dreams of his turn.",
        "Zanele prepares for the Zulu Umhlanga (Reed Dance) but struggles to balance her reed."
      ],
      language: "English",
      region: "Western Cape"
    }
  ];
  
  // Array of diverse author avatars
  const avatarImages = [
    "https://randomuser.me/api/portraits/women/12.jpg",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/75.jpg",
    "https://randomuser.me/api/portraits/women/89.jpg",
  ];
  
  // Shared categories across cultures
  const categories = ["Heritage", "Tradition", "History", "Community", "Folklore"];
  
  return Array.from({ length: count }, (_, i) => {
    const index = (startIndex + i) % 12;
    const cultureIndex = Math.floor(index / 4); // Distribute evenly among the 3 cultures
    const itemIndex = index % 4; // Get specific item within the culture
    const culture = culturalContent[cultureIndex];
    
    return {
      id: `comic-${startIndex + i + 1}`,
      title: culture.titles[itemIndex],
      description: culture.descriptions[itemIndex],
      imageUrl: culture.images[itemIndex],
      author: {
        name: `Author ${(index % 5) + 1}`,
        avatar: avatarImages[index % 5],
      },
      category: categories[index % categories.length],
      language: culture.language,
      region: culture.region,
      likes: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    }
  })
}

// Initial mock data - start with exactly 12
const INITIAL_COMICS = generateMockComics(0, 12)

// Filter options
const CATEGORIES = ["All", "Heritage", "Tradition", "History", "Community", "Folklore"]
const LANGUAGES = ["All", "Zulu", "Xhosa", "English"]
const REGIONS = ["All", "KwaZulu-Natal", "Eastern Cape", "Western Cape"]
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
]

// Get category color
const getCategoryColor = (category: string) => {
  const colors = {
    "Heritage": "bg-blue-100 text-blue-800",
    "Tradition": "bg-purple-100 text-purple-800",
    "History": "bg-green-100 text-green-800",
    "Community": "bg-pink-100 text-pink-800",
    "Folklore": "bg-amber-100 text-amber-800",
  }
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

// Comic Card with Enhanced Animation
const ComicItem = ({ comic, index, columnsPerRow = 4 }: { comic: Comic; index: number; columnsPerRow?: number }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="h-full">
      <Link href={`/comic/${comic.id}`}>
        <motion.div 
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col"
          whileHover={{ 
            y: -8, 
            x: 0,
            rotateY: 2,
            transition: { duration: 0.3 } 
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="relative aspect-[5/4] overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 z-10 opacity-0" 
              animate={{ opacity: isHovered ? 0.5 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src={comic.imageUrl}
              alt={comic.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                scale: isLoaded ? (isHovered ? 1.1 : 1) : 1.1,
              }}
              transition={{ duration: 0.5 }}
              onLoad={() => setIsLoaded(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 z-20">
              <motion.h3 
                className="font-bold text-white text-lg line-clamp-1"
                animate={{ y: isHovered ? -3 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {comic.title}
              </motion.h3>
            </div>
            <div className="absolute top-3 right-3 z-20">
              <Badge className={`${getCategoryColor(comic.category)} py-0.5 px-2 font-medium shadow-sm`}>
                {comic.category}
              </Badge>
            </div>
          </div>
          
          <motion.div 
            className="p-3 flex flex-col flex-grow"
            animate={{ 
              backgroundColor: isHovered ? "rgba(249, 250, 251, 1)" : "rgba(255, 255, 255, 1)" 
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-gray-600 text-sm line-clamp-2 mb-2"
              animate={{ 
                color: isHovered ? "rgba(31, 41, 55, 1)" : "rgba(75, 85, 99, 1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {comic.description}
            </motion.p>
            
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <motion.img 
                  src={comic.author.avatar} 
                  alt={comic.author.name} 
                  className="w-6 h-6 rounded-full border border-gray-200"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                />
                <p className="text-xs font-medium text-gray-700">{comic.author.name}</p>
              </div>
              <motion.div 
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.1 }}
              >
                <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
                  </motion.div>
                  {comic.likes}
                </span>
                <Badge variant="outline" className="ml-1 text-xs border-blue-200 text-blue-600">
                  {comic.language}
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </div>
  )
}

// Background Floating Elements Component
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-purple-200 to-blue-200 opacity-50"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50, 0],
            x: [0, Math.random() * 100 - 50, 0],
            rotate: [0, Math.random() * 360, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function BrowseComicsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLanguage, setSelectedLanguage] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [sortOption, setSortOption] = useState("recent")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [allComics, setAllComics] = useState(INITIAL_COMICS)
  const [filteredComics, setFilteredComics] = useState<Comic[]>([])
  
  // Simulate loading initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilteredComics(allComics)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [allComics])
  
  // Apply filters
  useEffect(() => {
    let result = [...allComics]

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
  }, [allComics, searchQuery, selectedCategory, selectedLanguage, selectedRegion, sortOption])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white relative overflow-hidden">
        <FloatingElements />
        
        <Header />
        
        <div className="container mx-auto px-4 pt-6 pb-16 max-w-7xl relative z-10">
          {/* Page Title */}
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Browse Comics
            </h1>
            <p className="text-indigo-700 opacity-90 mt-2">
              Discover South African cultural stories and comics
            </p>
          </motion.div>
        
          {/* Search and Filter Bar */}
          <motion.div 
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 mb-4 z-40 border border-indigo-100"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                  <Input
                    placeholder="Search comics..."
                    className="pl-10 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200 text-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex gap-2 flex-wrap text-black">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px] border-indigo-100">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-indigo-500" />
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 border-indigo-100 hover:bg-indigo-50 text-black"
                  >
                    <Filter className="h-4 w-4 text-indigo-500" />
                    Filters
                    <ChevronDown className={`h-4 w-4 transition-transform text-indigo-500 ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                  
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg">
                      Create Comic
                    </Button>
                  </Link>
                </div>
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
                  <div className="pt-4 mt-4 border-t border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block text-indigo-700">Category</Label>
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                          <TabsList className="grid grid-cols-3 h-auto bg-indigo-50">
                            {CATEGORIES.map((category) => (
                              <TabsTrigger 
                                key={category} 
                                value={category} 
                                className="text-xs py-1 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
                              >
                                {category}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block text-indigo-700">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="border-indigo-100">
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
                        <Label className="text-sm font-medium mb-2 block text-indigo-700">Region</Label>
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                          <SelectTrigger className="border-indigo-100">
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
                      <Button 
                        variant="outline" 
                        onClick={resetFilters} 
                        className="text-sm border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Stats */}
          <motion.div 
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="text-sm text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full shadow-sm">
              Showing <span className="font-bold text-indigo-900">{filteredComics.length}</span> comics
              {selectedCategory !== "All" && (
                <Badge variant="outline" className="ml-2 font-normal border-indigo-200 text-indigo-700 bg-white">
                  {selectedCategory}
                </Badge>
              )}
              {selectedLanguage !== "All" && (
                <Badge variant="outline" className="ml-2 font-normal border-indigo-200 text-indigo-700 bg-white">
                  {selectedLanguage}
                </Badge>
              )}
              {selectedRegion !== "All" && (
                <Badge variant="outline" className="ml-2 font-normal border-indigo-200 text-indigo-700 bg-white">
                  {selectedRegion}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Comics Grid with Sequential Animation */}
          {filteredComics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 mb-8">
              {filteredComics.map((comic, index) => (
                <div key={comic.id}>
                  <ComicItem 
                    comic={comic} 
                    index={index} 
                    columnsPerRow={4}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">No comics found</h3>
              <p className="text-indigo-600 mb-6">We couldn't find any comics matching your search criteria.</p>
              <Button 
                onClick={resetFilters}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Reset Filters
              </Button>
            </motion.div>
          )}
          
          {/* Loading indicator - More professional */}
          {isLoading && filteredComics.length > 0 && (
            <motion.div 
              className="flex justify-center py-8 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100">
                <ComicLoader />
                <p className="text-center text-indigo-700 font-medium mt-3">Loading comics...</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
