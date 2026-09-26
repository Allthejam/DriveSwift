
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Separator = () => (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>
);

export default function AboutPage() {
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
                            <CardTitle className="text-3xl">About DriveSwift</CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert">
                            <p>At DriveSwift, our journey began from a deep-rooted understanding of the driving instruction industry. Founded by a seasoned driving instructor, we intimately experienced the challenges and triumphs that define this highly rewarding, yet often unforgiving, profession. It was this first-hand insight that revealed a significant gap in the market: a pressing need for a more accessible and affordable platform designed to empower driving instructors at every stage of their career.</p>
                            
                            <Separator />

                            <h2>Our Vision: Empowering Every Instructor</h2>
                            <p>We believe that every Provisional Driving Instructor (PDI) and Approved Driving Instructor (ADI) deserves the tools and support necessary to thrive. The initial investment and ongoing costs associated with managing a driving school can be daunting, often hindering passionate individuals from establishing or growing their businesses effectively. DriveSwift was created to dismantle these barriers.</p>

                            <Separator />

                            <h2>The DriveSwift Difference</h2>
                            <p>Our platform is meticulously crafted to be a comprehensive, all-in-one solution that delivers exceptional value without compromising on functionality. We integrate essential features such as smart diary management, comprehensive pupil records, streamlined payment processing, and intuitive progress tracking into an intuitive, user-friendly interface. This means less time spent on administrative tasks and more time dedicated to quality instruction.</p>
                            <p>We are particularly passionate about supporting PDIs. We understand the unique hurdles faced when entering this industry, from managing initial clients to building a sustainable business model. DriveSwift provides a robust, yet affordable, foundation that helps new instructors establish professional practices from day one, giving them the confidence and efficiency needed to succeed.</p>

                            <Separator />

                            <h2>Our Commitment</h2>
                            <p>At DriveSwift, we are committed to continuous innovation, driven by the feedback and evolving needs of the driving instruction community. Our goal is to be more than just a software provider; we aim to be a dedicated partner in your success, helping you navigate the complexities of the industry with ease and confidence.</p>
                            <p>Join us in revolutionising how driving schools operate. Experience the difference of a platform built by instructors, for instructors.</p>
                        
                            <Separator />
                        
                            <p className="text-sm text-muted-foreground">This content is for informational purposes only. Product links are to Amazon UK and may be affiliate links.</p>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
