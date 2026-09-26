
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { contactSubmissions } from "@/lib/data"
import { Car, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function ContactPage() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        setIsSuperAdmin(searchParams.get('instructorId') === 'super-admin');
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        // In a real app, this would be an API call.
        // Here, we just add it to our mock data array.
        contactSubmissions.unshift({
            id: `cs-${Date.now()}`,
            name,
            email,
            subject,
            message,
            date: new Date().toISOString(),
            isRead: false,
            category: 'General'
        });

        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you soon.",
        });

        (e.target as HTMLFormElement).reset();
    }

    return (
        <div className="flex flex-col min-h-screen">
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
            <main className="flex-1 flex items-center justify-center bg-muted/40">
                <Card className="w-full max-w-2xl m-4">
                    <CardHeader>
                        <CardTitle className="text-3xl">Contact Us</CardTitle>
                        <CardDescription>
                            Have a question or feedback? Fill out the form below and we'll get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" name="message" required className="min-h-[150px]" />
                            </div>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
