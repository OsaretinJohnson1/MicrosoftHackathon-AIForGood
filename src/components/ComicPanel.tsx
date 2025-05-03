import { Card, CardContent } from "@/components/ui/card"
import type { Panel } from "@/types/comic"

interface ComicPanelProps {
  panel: Panel
  large?: boolean
  index?: number
}

export function ComicPanel({ panel, large = false, index }: ComicPanelProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-purple-100">
      <div className={`relative ${large ? "aspect-[4/3]" : "aspect-square"}`}>
        {index && (
          <div className="absolute top-2 left-2 z-10 bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {index}
          </div>
        )}
        <img
          src={panel.imageUrl || "/placeholder.svg"}
          alt={`Comic panel: ${panel.caption}`}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent
        className={`p-4 bg-gradient-to-r from-purple-50 to-white ${large ? "border-t border-purple-100" : ""}`}
      >
        <p className={`${large ? "text-lg" : "text-sm"} text-gray-800 font-medium`}>{panel.caption}</p>
      </CardContent>
    </Card>
  )
}
