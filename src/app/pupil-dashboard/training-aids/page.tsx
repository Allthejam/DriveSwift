
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trainingAids } from "@/lib/data"
import Image from "next/image"

function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    const videoId = urlObj.searchParams.get("v")
    if (urlObj.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return null
  } catch (error) {
    return null
  }
}

export default function PupilTrainingAidsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Training Aids</h1>
        <p className="text-muted-foreground">Resources to help you prepare for your tests.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trainingAids.map((aid) => {
          const embedUrl = getYouTubeEmbedUrl(aid.youtubeUrl)
          return (
            <Card key={aid.id} className="flex flex-col">
              <div className="relative aspect-video bg-muted rounded-t-lg">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={aid.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-t-lg"
                  ></iframe>
                ) : (
                  <Image
                    src={aid.image}
                    alt={aid.title}
                    fill
                    className="rounded-t-lg object-cover"
                    data-ai-hint="driving lesson"
                  />
                )}
              </div>
              <CardContent className="flex-grow flex flex-col pt-6">
                  <Badge variant="secondary" className="w-fit mb-2">{aid.category}</Badge>
                  <CardTitle className="text-lg font-semibold leading-tight">{aid.title}</CardTitle>
                  <CardDescription className="mt-1 flex-grow">{aid.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
