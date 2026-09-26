"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function TermsAndConditionsContent() {
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
                                <ArrowLeft className="mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                         {isSuperAdmin && (
                            <Button variant="secondary" disabled>
                                <Edit className="mr-2" />
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
                            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert">
                            <p>Welcome to DriveSwift. These terms and conditions outline the rules and regulations for the use of DriveSwift's Website and Services.</p>

                            <h2>1. Acceptance of Terms</h2>
                            <p>By accessing this website and using our services, we assume you accept these terms and conditions. Do not continue to use DriveSwift if you do not agree to take all of the terms and conditions stated on this page.</p>

                            <h2>2. Subscription and Payments</h2>
                            <p>DriveSwift offers subscription-based services. You agree to pay all applicable fees associated with your chosen subscription plan. Subscriptions automatically renew unless cancelled prior to the renewal date.</p>

                            <h2>3. User Accounts</h2>
                            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

                            <h2>4. Data and Privacy</h2>
                            <p>Your privacy is important to us. Please review our Privacy Policy and Cookie Policy to understand how we collect, use, and protect your personal information.</p>

                            <h2>5. Limitation of Liability</h2>
                            <p>In no event shall DriveSwift, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website or service.</p>

                            <h2>6. Governing Law</h2>
                            <p>These terms will be governed by and interpreted in accordance with the laws of the United Kingdom, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the UK for the resolution of any disputes.</p>

                            <p className="text-sm text-muted-foreground mt-8">Last updated: May 2024</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function TermsAndConditionsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">Loading Terms & Conditions...</div>}>
            <TermsAndConditionsContent />
        </Suspense>
    );
}
