"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Calendar } from "lucide-react"
import type { Comic } from "@/types/comic"

interface ComicCardProps {
  comic: Comic
}

export function ComicCard({ comic }: ComicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    }).format(date)
  }

  return (
    <Link href={`/comic/${comic.id}`}>
      <Card 
        className="overflow-hidden h-full border-green-100 transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.img
            src={comic.imageUrl}
            alt={comic.title}
            className="w-full h-full object-cover"
            animate={{ 
              scale: isHovered ? 1.05 : 1 
            }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {comic.category}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-green-900 text-lg mb-2 line-clamp-1">{comic.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{comic.description}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={comic.author.avatar} 
              alt={comic.author.name} 
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-muted-foreground">{comic.author.name}</span>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{comic.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(comic.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
} 