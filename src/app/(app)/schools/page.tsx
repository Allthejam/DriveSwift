
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { instructors as initialInstructors, pupils, type Instructor, type School, schools as initialSchools, signupRequests as initialSignupRequests } from "@/lib/data"
import { LogIn, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function SchoolsPage() {
    const { toast } = useToast();
    const [schools, setSchools] = useState(initialSchools);
    const [signupRequests, setSignupRequests] = useState(initialSignupRequests);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSchools(initialSchools);
        setSignupRequests(initialSignupRequests);
        setIsLoading(false);
    }, []);


    const handleApprove = (requestId: string) => {
        const request = signupRequests.find(r => r.id === requestId);
        if (!request) return;

        const newSchoolId = `school-${Date.now()}`;
        const newOwnerId = `instructor-${Date.now()}`;

        // Create new instructor (owner)
        const newOwner: Instructor = {
            id: newOwnerId,
            schoolId: newSchoolId,
            name: request.ownerName,
            email: request.email,
            phone: request.phone,
            registrationNumber: request.registrationNumber,
            accountType: request.accountType,
            status: 'approved',
            subscriptionTier: request.accountType === 'PDI' ? 'pdi' : 'solo',
            subscriptionStatus: request.accountType === 'PDI' ? 'free' : 'trial',
            settings: { // Default settings
                pricing: [],
                rules: { minLessonDurationMinutes: 60 },
                carDetails: { make: "", model: "", transmission: "Manual", fuelType: "", colour: "", registration: "" },
                holidayMode: { enabled: false, startDate: null, endDate: null },
                notifications: { email: true, push: true }
            }
        };
        initialInstructors.push(newOwner);

        // Create new school
        const newSchool: School = {
            id: newSchoolId,
            name: request.schoolName,
            ownerId: newOwnerId,
            subscriptionTier: newOwner.subscriptionTier || 'solo',
            subscriptionStatus: newOwner.subscriptionStatus || 'trial',
            trialEndDate: newOwner.trialEndDate,
        };
        
        // Update state
        setSchools(prev => [...prev, newSchool]);
        setSignupRequests(prev => prev.filter(r => r.id !== requestId));

        // Update "DB"
        initialSchools.push(newSchool);
        const requestIndex = initialSignupRequests.findIndex(r => r.id === requestId);
        if(requestIndex > -1) initialSignupRequests.splice(requestIndex, 1);
        
        toast({
            title: "School Approved",
            description: `${request.schoolName} is now active on the platform.`,
        });
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({length: 6}).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {signupRequests.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>New schools waiting to be approved.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {signupRequests.map(req => (
                            <Card key={req.id} className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        {req.schoolName}
                                        <Badge variant={req.accountType === 'ADI' ? 'default' : 'secondary'}>{req.accountType}</Badge>
                                    </CardTitle>
                                    <CardDescription>Owner: {req.ownerName}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm"><span className="font-semibold">Email:</span> {req.email}</p>
                                    <p className="text-sm"><span className="font-semibold">Phone:</span> {req.phone}</p>
                                    <p className="text-sm"><span className="font-semibold">Reg No:</span> {req.registrationNumber}</p>
                                    <Button className="w-full mt-2" onClick={() => handleApprove(req.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve School
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
           
            <Card>
                <CardHeader>
                    <CardTitle>All Schools</CardTitle>
                    <CardDescription>Oversee all subscribed driving schools.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {schools.map(school => {
                            const schoolInstructors = initialInstructors.filter(i => i.schoolId === school.id);
                            const schoolPupilCount = pupils.filter(p => schoolInstructors.map(i => i.id).includes(p.instructorId)).length;
                            return (
                                <Card key={school.id}>
                                    <CardHeader>
                                        <CardTitle>{school.name}</CardTitle>
                                        <CardDescription>Owner: {initialInstructors.find(i => i.id === school.ownerId)?.name}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Instructors</span>
                                            <span className="font-semibold">{schoolInstructors.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Pupils</span>
                                            <span className="font-semibold">{schoolPupilCount}</span>
                                        </div>
                                         <Button asChild className="w-full mt-4">
                                            <Link href={`/dashboard?schoolId=${school.id}&instructorId=${school.ownerId}&ghost=true`}>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Ghost Login as Admin
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
