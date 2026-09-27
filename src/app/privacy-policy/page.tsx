"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PrivacyPolicyContent() {
    const searchParams = useSearchParams();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        setIsSuperAdmin(searchParams.get('instructorId') === 'super-admin');
    }, [searchParams]);

    const handleOpenCookieModal = () => {
        window.dispatchEvent(new Event("driveswift:open-cookie-banner"));
    };

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
                                <Shield className="h-8 w-8 text-primary" /> Privacy Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert space-y-6">
                            <p className="lead">
                                At DriveSwift, we take your data protection and privacy very seriously. This Privacy Policy explains how we collect, use, store, and protect your personal information when using our web platform and mobile apps.
                            </p>

                            <h2>1. Information We Collect</h2>
                            <p>We collect information you provide directly when creating an account, managing your profile, or booking driving lessons:</p>
                            <ul>
                                <li><strong>Account & Identity Data:</strong> Full name, email address, phone number, role (Instructor, School Owner, or Pupil).</li>
                                <li><strong>Driving School Data:</strong> Registration numbers, licence details, pupil syllabus logs, lesson schedules, and financial records.</li>
                                <li><strong>Technical & Consent Data:</strong> IP address, device information, browser type, and cookie consent preferences.</li>
                            </ul>

                            <h2>2. How We Use Your Data</h2>
                            <p>Your information is processed strictly to provide and enhance DriveSwift services:</p>
                            <ul>
                                <li>To manage lesson bookings, progress logs, and automated notifications.</li>
                                <li>To process subscription payments and account management.</li>
                                <li>To provide AI-generated lesson planning tools.</li>
                                <li>To maintain application security, fraud prevention, and audit compliance.</li>
                            </ul>

                            <h2>3. Data Storage & Security</h2>
                            <p>
                                All user data is encrypted in transit and at rest using industry-standard enterprise Firebase & Google Cloud infrastructure. We never sell your personal data to third parties.
                            </p>

                            <h2>4. Your GDPR Rights</h2>
                            <p>Under UK and EU Data Protection regulations (GDPR), you have the right to:</p>
                            <ul>
                                <li>Access, correct, or request deletion of your personal data.</li>
                                <li>Export your pupil and lesson history records.</li>
                                <li>
                                    Manage your cookie and tracking preferences at any time by clicking{" "}
                                    <button onClick={handleOpenCookieModal} className="text-primary underline font-medium cursor-pointer">
                                        Cookie Preferences
                                    </button>.
                                </li>
                            </ul>

                            <h2>5. Contact Us</h2>
                            <p>If you have any questions regarding this Privacy Policy or your data, please contact our Data Protection team at <strong>privacy@driveswift.com</strong>.</p>

                            <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">Last updated: September 2026</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">Loading Privacy Policy...</div>}>
            <PrivacyPolicyContent />
        </Suspense>
    );
}
