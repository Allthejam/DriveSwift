
"use client";

import { trainingAids } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function TrainingAidsPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trainingAids.map((aid) => (
        <Card key={aid.id}>
          <CardHeader>
            <CardTitle>{aid.title}</CardTitle>
            <CardDescription>{aid.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative aspect-video rounded-md overflow-hidden">
              <Image
                src={aid.image}
                alt={aid.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between">
              <Badge>{aid.category}</Badge>
              {aid.youtubeUrl ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={aid.youtubeUrl} target="_blank">
                    Watch Video
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  No Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
