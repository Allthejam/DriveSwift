
"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function GhostBannerContent() {
    const searchParams = useSearchParams();
    const isGhost = searchParams.get('ghost') === 'true';

    if (!isGhost) {
        return null;
    }

    return (
        <Alert className="bg-yellow-100 border-yellow-300 text-yellow-900 rounded-none border-x-0 border-t-0 flex items-center justify-between">
            <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 mr-3" />
                <div>
                    <AlertTitle className="font-bold">Ghost Mode Active</AlertTitle>
                    <AlertDescription>
                        You are viewing this page as another user. Any actions you take will be as them.
                    </AlertDescription>
                </div>
            </div>
            <Button asChild variant="outline" className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border-yellow-400">
                <Link href="/dashboard?instructorId=super-admin">
                    Return to Super Admin
                </Link>
            </Button>
        </Alert>
    );
}

export function GhostBanner() {
    return (
        <Suspense fallback={null}>
            <GhostBannerContent />
        </Suspense>
    )
}
