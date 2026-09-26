
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signupRequests, deniedSignupRequests, type SignupRequest, schools, instructors, type Instructor } from "@/lib/data";
import { Car, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addDays } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignUpPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accountType, setAccountType] = useState<'PDI' | 'ADI' | ''>('');
    const [deniedWarning, setDeniedWarning] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    const checkEmail = (email: string) => {
        const isDenied = deniedSignupRequests.some(req => req.email.toLowerCase() === email.toLowerCase());
        if (isDenied) {
            setDeniedWarning("This account has already been registered and is on hold or has been denied. If you think this is a mistake, please contact admin.");
        } else {
            setDeniedWarning(null);
        }
    }


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        
        const email = formData.get('email') as string;
        const ownerName = formData.get('ownerName') as string;
        const selectedAccountType = accountType as 'PDI' | 'ADI';
        const address = {
            line1: formData.get('addressLine1') as string,
            city: formData.get('city') as string,
            postcode: formData.get('postcode') as string,
        }

        const newSchoolId = `school-${Date.now()}`;
        const newOwnerId = `instructor-${Date.now()}`;

        const newRequest: SignupRequest = {
            id: `req-${Date.now()}`,
            schoolName: formData.get('schoolName') as string,
            ownerName,
            email,
            phone: formData.get('phone') as string,
            registrationNumber: formData.get('registrationNumber') as string,
            accountType: selectedAccountType,
            address,
            status: 'pending',
            date: new Date().toISOString()
        };

        const isPDI = selectedAccountType === 'PDI';
        const trialEndDate = isPDI ? undefined : addDays(new Date(), 28).toISOString();

        const newOwner: Instructor = {
            id: newOwnerId,
            schoolId: newSchoolId,
            name: ownerName,
            email: email,
            phone: newRequest.phone,
            registrationNumber: newRequest.registrationNumber,
            address: newRequest.address,
            accountType: newRequest.accountType,
            status: 'pending', // New accounts are pending by default
            subscriptionTier: isPDI ? 'pdi' : 'solo',
            subscriptionStatus: isPDI ? 'free' : 'trial',
            trialEndDate,
            settings: { 
                pricing: [],
                rules: { minLessonDurationMinutes: 60 },
                carDetails: { make: "", model: "", transmission: "Manual", fuelType: "", colour: "", registration: "" },
                holidayMode: { enabled: false, startDate: null, endDate: null },
                notifications: { email: true, push: true }
            }
        };

         const newSchool: typeof schools[0] = {
            id: newSchoolId,
            name: newRequest.schoolName,
            ownerId: newOwnerId,
            subscriptionTier: newOwner.subscriptionTier || 'solo',
            subscriptionStatus: newOwner.subscriptionStatus || 'trial',
            trialEndDate: newOwner.trialEndDate,
        };

        // Simulate API call
        setTimeout(() => {
            // Add to live data immediately
            instructors.push(newOwner);
            schools.push(newSchool);
            // Add to queue for admin approval
            signupRequests.push(newRequest);
            
            toast({
                title: "Registration Submitted!",
                description: "Your account has been created and is awaiting approval. You can now log in.",
            });
            router.push(`/dashboard?schoolId=${newSchoolId}&instructorId=${newOwnerId}`);
            setIsSubmitting(false);
        }, 1000);
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="mx-auto w-full max-w-lg">
                <CardHeader className="text-center">
                     <Link href="/" className="mb-4 inline-flex items-center justify-center">
                        <Car className="h-12 w-12 text-primary" />
                    </Link>
                    <CardTitle className="text-2xl font-bold">Register Your School</CardTitle>
                    <CardDescription>Join the DriveSwift platform and grow your business.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="schoolName">Driving School Name</Label>
                                <Input id="schoolName" name="schoolName" required />
                            </div>
                            <div>
                                <Label htmlFor="ownerName">Your Full Name</Label>
                                <Input id="ownerName" name="ownerName" required />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" required onBlur={(e) => checkEmail(e.target.value)} />
                                {deniedWarning && (
                                    <Alert variant="destructive" className="mt-2 text-xs p-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {deniedWarning}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                             <div>
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input id="phone" name="phone" type="tel" required />
                            </div>
                        </div>
                        
                        <div>
                            <Label>Business Address</Label>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <Input id="addressLine1" name="addressLine1" placeholder="Address Line 1" required />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input id="city" name="city" placeholder="City" required />
                                    <Input id="postcode" name="postcode" placeholder="Postcode" required />
                                </div>
                            </div>
                        </div>


                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="registrationNumber">Instructor Registration Number (PRN/ADI)</Label>
                                <Input id="registrationNumber" name="registrationNumber" required />
                            </div>
                            <div>
                                <Label htmlFor="accountType">Account Type</Label>
                                <Select onValueChange={(value: 'PDI' | 'ADI') => setAccountType(value)} required>
                                    <SelectTrigger id="accountType">
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDI">PDI (Potential Driving Instructor)</SelectItem>
                                        <SelectItem value="ADI">ADI (Approved Driving Instructor)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-3 pt-2">
                             <div className="flex items-center space-x-2">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the <Link href="/terms-and-conditions" className="underline" target="_blank">Terms and Conditions</Link>
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="cookies" checked={cookiesAccepted} onCheckedChange={(checked) => setCookiesAccepted(checked as boolean)} />
                                <label
                                    htmlFor="cookies"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                     I accept the <Link href="/cookie-policy" className="underline" target="_blank">Cookie Policy</Link>
                                </label>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting || !accountType || !!deniedWarning || !termsAccepted || !cookiesAccepted}>
                            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                        </Button>
                         <div className="mt-4 text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="underline">
                            Log in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
