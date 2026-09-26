
"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { instructors as initialInstructors, pupils, type Instructor } from "@/lib/data"
import { ArrowUpRight, PlusCircle, Car, Phone, Users, BookUser } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

function AddInstructorDialog({ onAddInstructor, onOpenChange, schoolId }: { onAddInstructor: (instructor: Instructor) => void, onOpenChange: (open: boolean) => void, schoolId: string }) {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newInstructor: Instructor = {
            id: `instructor-${Date.now()}`,
            schoolId: schoolId,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            registrationNumber: 'pending',
            accountType: 'ADI', // Default
            status: 'approved',
            // Add default empty settings for a new instructor
            settings: {
                pricing: [],
                rules: { minLessonDurationMinutes: 60 },
                carDetails: {
                    make: "", model: "", transmission: "Manual", fuelType: "", colour: "", registration: ""
                },
                holidayMode: { enabled: false, startDate: null, endDate: null },
                notifications: { email: true, push: true }
            }
        };
        onAddInstructor(newInstructor);
        onOpenChange(false);
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
                <DialogDescription>
                    Enter the details for the new instructor to add them to your school.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required />
                </div>
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required />
                </div>
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" required />
                </div>
                <DialogFooter>
                    <Button type="submit">Add Instructor</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

export default function InstructorsPage() {
    const searchParams = useSearchParams();
    const schoolId = searchParams.get('schoolId') || '1';

    const [instructors, setInstructors] = useState(initialInstructors.filter(i => i.schoolId === schoolId));
    const [isDialogOpen, setIsDialogOpen] = useState(false);

     useEffect(() => {
        setInstructors(initialInstructors.filter(i => i.schoolId === schoolId));
    }, [schoolId]);

    const handleAddInstructor = (newInstructor: Instructor) => {
        setInstructors(prev => [...prev, newInstructor]);
        // Note: This only updates local state. In a real app, this would be an API call.
        initialInstructors.push(newInstructor);
    };

    return (
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Instructors</CardTitle>
                    <CardDescription>
                        Manage the instructors in your driving school.
                    </CardDescription>
                    </div>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Instructor
                        </Button>
                    </DialogTrigger>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {instructors.map((instructor) => {
                            const instructorPupilCount = pupils.filter(p => p.instructorId === instructor.id).length;
                            return (
                                <Card key={instructor.id}>
                                    <CardHeader className="flex-row items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{instructor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl">{instructor.name}</CardTitle>
                                            <CardDescription>
                                                <Badge variant={instructor.accountType === 'ADI' ? 'default' : 'secondary'} className="mr-2">{instructor.accountType}</Badge>
                                                {instructor.email}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{instructor.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <BookUser className="h-4 w-4 text-muted-foreground" />
                                            <span>{instructor.registrationNumber}</span>
                                        </div>
                                         <div className="flex items-center gap-3 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{instructorPupilCount} active pupils</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Car className="h-4 w-4 text-muted-foreground" />
                                            <span>{instructor.settings.carDetails.make} {instructor.settings.carDetails.model} ({instructor.settings.carDetails.registration})</span>
                                        </div>
                                        <Button asChild variant="outline" className="w-full mt-4">
                                            <Link href={`/profile?instructorId=${instructor.id}&schoolId=${schoolId}`}>
                                                View Profile
                                                <ArrowUpRight className="ml-2 h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
            <AddInstructorDialog onAddInstructor={handleAddInstructor} onOpenChange={setIsDialogOpen} schoolId={schoolId} />
        </Dialog>
    )
}
