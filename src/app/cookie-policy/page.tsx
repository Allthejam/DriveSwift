
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CookiePolicyPage() {
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
                            <CardTitle className="text-3xl">Cookie Policy</CardTitle>
                            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert">
                            <p>This Cookie Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used.</p>
                            <p>Cookies do not typically contain any information that personally identifies a user, but personal information that we store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy.</p>
                            
                            <h2>What are Cookies?</h2>
                            <p>Cookies are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p>

                            <h2>Types of Cookies We Use</h2>
                            <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.</p>
                            <p>We use both session and persistent Cookies for the purposes set out below:</p>
                            <ul>
                                <li>
                                    <p><strong>Necessary / Essential Cookies</strong></p>
                                    <p>Type: Session Cookies</p>
                                    <p>Administered by: Us</p>
                                    <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
                                </li>
                                <li>
                                    <p><strong>Functionality Cookies</strong></p>
                                    <p>Type: Persistent Cookies</p>
                                    <p>Administered by: Us</p>
                                    <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
                                </li>
                            </ul>

                             <h2>Your Choices Regarding Cookies</h2>
                            <p>If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.</p>
                            <p>If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
