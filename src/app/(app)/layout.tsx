import { AppHeader } from "@/components/layout/app-header";
import { GhostBanner } from "@/components/layout/ghost-banner";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
        <GhostBanner />
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 bg-background">
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading page...</div>}>
                {children}
            </Suspense>
        </main>
    </div>
  )
}
