
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TermsAndConditionsPage() {
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
                            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert">
                            <p>Please read these terms and conditions carefully before using Our Service.</p>

                            <h2>Interpretation and Definitions</h2>
                            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                            
                            <h2>Acknowledgment</h2>
                            <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                            <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
                            <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>

                            <h2>User Accounts</h2>
                            <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>
                            <p>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media Service.</p>

                            <h2>Termination</h2>
                            <p>We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
                            <p>Upon termination, Your right to use the Service will cease immediately. If You wish to terminate Your account, You may simply discontinue using the Service.</p>
                            
                            <h2>Changes to These Terms and Conditions</h2>
                            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
