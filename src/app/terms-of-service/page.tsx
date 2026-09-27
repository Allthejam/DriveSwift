"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function TermsOfServiceContent() {
    const searchParams = useSearchParams();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        setIsSuperAdmin(searchParams.get('instructorId') === 'super-admin');
    }, [searchParams]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Car className="h-6 w-6 text-primary" />
                        <span className="font-bold">DriveSwift</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        {isSuperAdmin && (
                            <Button variant="secondary" disabled>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Page
                            </Button>
                        )}
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/sign-up">Get Started Free</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 py-12 md:py-16">
                <div className="container max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" /> Terms of Service
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert space-y-6">
                            <p className="lead">
                                These Terms of Service govern your access to and use of DriveSwift software, websites, mobile applications, and services.
                            </p>

                            <h2>1. Account Registration & Roles</h2>
                            <p>
                                By creating an account on DriveSwift, you agree to provide accurate and complete registration details. You are responsible for safeguarding your login credentials and for all activities under your account.
                            </p>

                            <h2>2. Instructor & Driving School Responsibilities</h2>
                            <p>
                                Driving instructors (ADIs / PDIs) and driving schools are responsible for ensuring that pupil progress logs, DVSA test notes, and lesson gap schedules entered into DriveSwift are accurate.
                            </p>

                            <h2>3. Subscriptions & Billing</h2>
                            <p>
                                DriveSwift subscriptions automatically renew on a monthly or annual billing cycle depending on your plan (PDI, Solo, School, Academy, Enterprise). You may cancel your subscription at any time prior to the next billing date.
                            </p>

                            <h2>4. Acceptable Use</h2>
                            <p>
                                You agree not to misuse DriveSwift by attempting to gain unauthorized access, reverse engineer the platform, or submit unlawful content.
                            </p>

                            <h2>5. Legal References</h2>
                            <p>
                                For detailed information regarding our full legal terms and cookie policies, please consult our{" "}
                                <Link href="/terms-and-conditions" className="text-primary underline">
                                    Terms & Conditions
                                </Link>{" "}
                                and{" "}
                                <Link href="/cookie-policy" className="text-primary underline">
                                    Cookie Policy
                                </Link>
                                .
                            </p>

                            <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">Last updated: September 2026</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function TermsOfServicePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">Loading Terms of Service...</div>}>
            <TermsOfServiceContent />
        </Suspense>
    );
}
