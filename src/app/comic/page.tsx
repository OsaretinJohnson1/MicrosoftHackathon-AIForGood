import { Textarea } from "@/components/ui/textarea"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ComicViewer } from "@/components/ComicViewer"
import { LanguageSelector } from "@/components/LanguageSelector"
import { Download, Share2, ArrowLeft, Heart, MessageSquare, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { MotionDiv, fadeIn, staggerContainer } from "@/components/motion/motion"
import { PageTransition } from "@/components/motion/page-transition"

// This would normally fetch from your database
async function getComic(id: string) {
  // Mock data for demonstration
  return {
    id,
    title: "My Cultural Journey",
    description: "A story about traditional celebrations",
    panels: [
      {
        id: "1",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Panel 1",
        caption: "Growing up, my grandmother would prepare special dishes for our new year celebration.",
      },
      {
        id: "2",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Panel 2",
        caption: "The entire family would gather around the table, sharing stories of the past year.",
      },
      {
        id: "3",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Panel 3",
        caption: "Traditional music played as we danced late into the night.",
      },
      {
        id: "4",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Panel 4",
        caption: "These memories connect me to my heritage, even as I live far from home.",
      },
    ],
    author: {
      name: "Maya Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
    },
    createdAt: new Date().toISOString(),
    likes: 24,
    comments: 5,
  }
}

export default async function ComicPage({ params }: { params: { id: string } }) {
  try {
    const comic = await getComic(params.id)

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
                <Link href="/">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </MotionDiv>

              <div className="flex items-center gap-4">
                <MotionDiv variants={fadeIn(0.2, 0.5)}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </MotionDiv>
                <MotionDiv variants={fadeIn(0.3, 0.5)}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </MotionDiv>
                <MotionDiv variants={fadeIn(0.4, 0.5)}>
                  <LanguageSelector />
                </MotionDiv>
              </div>
            </MotionDiv>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <MotionDiv variants={fadeIn(0.5, 0.5)} className="lg:col-span-3">
                <Card className="p-6 mb-8 shadow-lg border-purple-100">
                  <MotionDiv variants={fadeIn(0.6, 0.5)} className="mb-6">
                    <h1 className="text-3xl font-bold text-purple-900 mb-2">{comic.title}</h1>
                    <p className="text-muted-foreground">{comic.description}</p>
                  </MotionDiv>

                  <ComicViewer panels={comic.panels} />

                  <MotionDiv variants={fadeIn(0.7, 0.5)} className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" className="flex items-center gap-2 text-rose-500">
                        <Heart className="h-5 w-5" />
                        <span>{comic.likes}</span>
                      </Button>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>{comic.comments}</span>
                      </Button>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5" />
                        Save
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">Created on {formatDate(comic.createdAt)}</div>
                  </MotionDiv>
                </Card>

                <MotionDiv variants={fadeIn(0.8, 0.5)}>
                  <Card className="p-6 shadow-lg border-purple-100">
                    <h2 className="text-xl font-semibold mb-4">Comments</h2>
                    <div className="space-y-4">
                      {[
                        {
                          name: "John Doe",
                          avatar: "/placeholder.svg?height=40&width=40&text=JD",
                          comment: "This reminds me of my family's traditions too! Beautiful comic.",
                          time: "2 days ago",
                        },
                        {
                          name: "Aisha Smith",
                          avatar: "/placeholder.svg?height=40&width=40&text=AS",
                          comment: "I love how you captured the essence of the celebration. The colors are vibrant!",
                          time: "1 day ago",
                        },
                      ].map((comment, index) => (
                        <MotionDiv
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <Avatar>
                            <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.name} />
                            <AvatarFallback>
                              {comment.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="font-medium mb-1">{comment.name}</div>
                              <p className="text-sm">{comment.comment}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{comment.time}</span>
                              <button className="hover:text-primary">Reply</button>
                              <button className="hover:text-primary">Like</button>
                            </div>
                          </div>
                        </MotionDiv>
                      ))}
                    </div>

                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                      className="mt-6 flex items-start gap-4"
                    >
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=You" alt="You" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea placeholder="Add a comment..." className="min-h-[100px]" />
                        <Button className="mt-2 bg-purple-700 hover:bg-purple-800">Post Comment</Button>
                      </div>
                    </MotionDiv>
                  </Card>
                </MotionDiv>
              </MotionDiv>

              <MotionDiv variants={fadeIn(1.0, 0.5)} className="space-y-6">
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card className="p-4 shadow-lg border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={comic.author.avatar || "/placeholder.svg"} alt={comic.author.name} />
                        <AvatarFallback>
                          {comic.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comic.author.name}</div>
                        <div className="text-xs text-muted-foreground">Comic Creator</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Card>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Card className="p-4 shadow-lg border-purple-100">
                    <h3 className="font-semibold mb-3">Related Comics</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((id, index) => (
                        <MotionDiv
                          key={id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <Link
                            href={`/comic/${id}`}
                            className="flex items-center gap-3 hover:bg-muted p-2 rounded-md transition-colors"
                          >
                            <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                              <img
                                src={`/placeholder.svg?height=64&width=64&text=${id}`}
                                alt={`Related comic ${id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Cultural Story #{id}</div>
                              <div className="text-xs text-muted-foreground">By Another Creator</div>
                            </div>
                          </Link>
                        </MotionDiv>
                      ))}
                    </div>
                  </Card>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="p-4 shadow-lg border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
                    <h3 className="font-semibold mb-3 text-purple-900">Create Your Own</h3>
                    <p className="text-sm text-purple-800 mb-4">
                      Share your cultural story and transform it into a beautiful comic like this one.
                    </p>
                    <Link href="/submit">
                      <Button className="w-full bg-purple-700 hover:bg-purple-800">Start Creating</Button>
                    </Link>
                  </Card>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  } catch (error) {
    return notFound()
  }
}
