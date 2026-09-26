

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pupils, type Pupil, type TestAttempt, lessons, lessonPlans, lessonFeedback, type Lesson, type LessonFeedback, type LessonPlan } from "@/lib/data";
import { Mail, Phone, Calendar as CalendarIcon, Edit, Home, BookUser, Award, MapPin, History, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";


const statusColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Booked': 'default',
    'Passed': 'secondary',
    'Failed': 'destructive',
    'Not Booked': 'outline'
};

const testAttemptSchema = z.object({
    status: z.enum(['Not Booked', 'Booked', 'Passed', 'Failed']),
    date: z.string().nullable(),
    location: z.string().nullable().optional(),
    certificateNumber: z.string().nullable().optional(),
})

const profileFormSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(1, "Phone number is required."),
    licenceNumber: z.string().min(1, "Licence number is required."),
    address: z.object({
        line1: z.string().min(1, "Address line 1 is required."),
        line2: z.string().optional(),
        city: z.string().min(1, "City is required."),
        postcode: z.string().min(1, "Postcode is required."),
    }),
    theoryTest: testAttemptSchema,
    practicalTest: testAttemptSchema,
}).superRefine((data, ctx) => {
    if (data.theoryTest.status === 'Booked' && !data.theoryTest.date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['theoryTest.date'],
            message: "Date is required when test is booked.",
        });
    }
    if (data.theoryTest.status === 'Passed' && !data.theoryTest.certificateNumber) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['theoryTest.certificateNumber'],
            message: "Certificate number is required for a passed test.",
        });
    }
    if (data.practicalTest.status === 'Booked') {
        if (!data.practicalTest.date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['practicalTest.date'],
                message: "Date is required when test is booked.",
            });
        }
        if (!data.practicalTest.location) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['practicalTest.location'],
                message: "Location is required when test is booked.",
            });
        }
    }
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function TestInfoCard({ title, test, isHistory }: { title: string, test: TestAttempt, isHistory?: boolean }) {
    return (
        <Card className={cn(isHistory && "bg-muted/50")}>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{title}</span>
                    <Badge variant={statusColors[test.status]}>{test.status}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{test.date ? new Date(test.date).toLocaleDateString('en-GB') : 'Not booked'}</span>
                </div>
                {test.location && (
                    <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{test.location}</span>
                    </div>
                )}
                {test.status === 'Passed' && test.certificateNumber && (
                    <div className="flex items-center gap-3 text-sm font-mono">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{test.certificateNumber}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function TestHistoryDisplay({ title, attempts }: { title: string, attempts: TestAttempt[] }) {
    if (!attempts || attempts.length === 0) {
        return <TestInfoCard title={title} test={{ status: 'Not Booked', date: null }} />;
    }

    const currentAttempt = attempts[attempts.length - 1];
    const previousAttempts = attempts.slice(0, -1);

    return (
        <div>
            <TestInfoCard title={title} test={currentAttempt} />
            {previousAttempts.length > 0 && (
                <div className="mt-4">
                     <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><History className="h-4 w-4" /> Previous Attempts</h4>
                     <div className="space-y-3">
                        {previousAttempts.slice().reverse().map((attempt, index) => (
                           <TestInfoCard key={index} title={`${title} (Attempt ${previousAttempts.length - index})`} test={attempt} isHistory />
                        ))}
                     </div>
                </div>
            )}
        </div>
    )
}

export default function PupilProfilePage() {
    const { toast } = useToast();
    // For demonstration, we'll use the first pupil's data and manage its state.
    const [pupil, setPupil] = React.useState<Pupil | undefined>(pupils[0]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {},
    });
    
    // Reset form when dialog opens with new data
    React.useEffect(() => {
        if (pupil && isDialogOpen) {
            const currentTheoryTest = pupil.theoryTest[pupil.theoryTest.length - 1] || { status: 'Not Booked', date: null };
            const currentPracticalTest = pupil.practicalTest[pupil.practicalTest.length - 1] || { status: 'Not Booked', date: null };

            form.reset({
                name: pupil.name,
                email: pupil.email,
                phone: pupil.phone,
                licenceNumber: pupil.licenceNumber,
                address: pupil.address,
                theoryTest: { ...currentTheoryTest, certificateNumber: currentTheoryTest.certificateNumber || "" },
                practicalTest: { ...currentPracticalTest, location: currentPracticalTest.location || "" }
            });
        }
    }, [pupil, form, isDialogOpen]);


    if (!pupil) {
        notFound();
    }
    
    function onSubmit(data: ProfileFormValues) {
        setPupil(prevPupil => {
            if (!prevPupil) return undefined;

            const updatedPupil = JSON.parse(JSON.stringify(prevPupil));

            // Update personal details
            updatedPupil.name = data.name;
            updatedPupil.email = data.email;
            updatedPupil.phone = data.phone;
            updatedPupil.address = data.address;
            updatedPupil.licenceNumber = data.licenceNumber;

            // Handle Theory Test
            const lastTheoryIndex = updatedPupil.theoryTest.length - 1;
            const lastTheoryTest = updatedPupil.theoryTest[lastTheoryIndex];
            
            if (data.theoryTest.status === 'Failed' && lastTheoryTest.status !== 'Failed') {
                updatedPupil.theoryTest[lastTheoryIndex] = { ...data.theoryTest, status: 'Failed' };
                updatedPupil.theoryTest.push({ status: 'Not Booked', date: null });
            } else {
                 updatedPupil.theoryTest[lastTheoryIndex] = {
                    ...data.theoryTest,
                    certificateNumber: data.theoryTest.certificateNumber || null,
                 };
            }

            // Handle Practical Test
            const lastPracticalIndex = updatedPupil.practicalTest.length - 1;
            const lastPracticalTest = updatedPupil.practicalTest[lastPracticalIndex];

            if (data.practicalTest.status === 'Failed' && lastPracticalTest.status !== 'Failed') {
                 updatedPupil.practicalTest[lastPracticalIndex] = { ...data.practicalTest, status: 'Failed' };
                 updatedPupil.practicalTest.push({ status: 'Not Booked', date: null });
            } else {
                updatedPupil.practicalTest[lastPracticalIndex] = {
                    ...data.practicalTest,
                    location: data.practicalTest.location || null,
                };
            }
            
            const pupilIndex = pupils.findIndex(p => p.id === pupil?.id);
            if(pupilIndex !== -1) {
                pupils[pupilIndex] = updatedPupil;
            }

            return updatedPupil;
        });

        setIsDialogOpen(false);
        toast({
            title: "Profile Updated",
            description: "Your details have been saved successfully.",
        });
    }

    const { address, theoryTest, practicalTest } = pupil;
    const theoryPassed = theoryTest.some(t => t.status === 'Passed');

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://placehold.co/100x100.png?text=${pupil.avatar}`} />
                                    <AvatarFallback>{pupil.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{pupil.name}</CardTitle>
                                    <CardDescription>Your Personal Profile</CardDescription>
                                </div>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                            <DialogHeader>
                                                <DialogTitle>Edit profile</DialogTitle>
                                                <DialogDescription>
                                                    Make changes to your profile here. Click save when you're done.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="max-h-[70vh] my-4">
                                                <div className="grid gap-6 py-4 pr-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold border-b pb-2">Personal Details</h4>
                                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Name</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl><Input type="email" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="phone" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Phone</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="licenceNumber" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Licence Number</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold border-b pb-2">Address</h4>
                                                            <FormField control={form.control} name="address.line1" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Address Line 1</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="address.line2" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                                                                    <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="address.city" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>City</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name="address.postcode" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Postcode</FormLabel>
                                                                    <FormControl><Input {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}/>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold border-b pb-2 mb-4">Test Status (Current Attempt)</h4>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-4 p-4 border rounded-lg">
                                                                <Label className="font-medium">Theory Test</Label>
                                                                <FormField control={form.control} name="theoryTest.status" render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Status</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value ?? 'Not Booked'}>
                                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                                            <SelectContent>
                                                                                <SelectItem value="Not Booked">Not Booked</SelectItem>
                                                                                <SelectItem value="Booked">Booked</SelectItem>
                                                                                <SelectItem value="Passed">Passed</SelectItem>
                                                                                <SelectItem value="Failed">Failed</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}/>
                                                                <FormField control={form.control} name="theoryTest.date" render={({ field }) => (
                                                                    <FormItem className="flex flex-col">
                                                                        <FormLabel>Date</FormLabel>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <FormControl>
                                                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                    </Button>
                                                                                </FormControl>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                                <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus/>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}/>
                                                                {form.watch('theoryTest.status') === 'Passed' && (
                                                                    <FormField control={form.control} name="theoryTest.certificateNumber" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Certificate Number</FormLabel>
                                                                            <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter certificate no." /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}/>
                                                                )}
                                                            </div>
                                                            <div className={cn("space-y-4 p-4 border rounded-lg", !theoryPassed && "opacity-50 bg-muted")}>
                                                                <Label className="font-medium">Practical Test</Label>
                                                                {!theoryPassed && (
                                                                    <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                                                                        <AlertTriangle className="h-4 w-4 !text-amber-600" />
                                                                        <AlertDescription>
                                                                            A theory test must be passed before booking a practical test.
                                                                        </AlertDescription>
                                                                    </Alert>
                                                                )}
                                                                <fieldset disabled={!theoryPassed} className="space-y-4">
                                                                    <FormField control={form.control} name="practicalTest.status" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Status</FormLabel>
                                                                            <Select onValueChange={field.onChange} value={field.value ?? 'Not Booked'}>
                                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Not Booked">Not Booked</SelectItem>
                                                                                    <SelectItem value="Booked">Booked</SelectItem>
                                                                                    <SelectItem value="Passed">Passed</SelectItem>
                                                                                    <SelectItem value="Failed">Failed</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}/>
                                                                    <FormField control={form.control} name="practicalTest.date" render={({ field }) => (
                                                                        <FormItem className="flex flex-col">
                                                                            <FormLabel>Date</FormLabel>
                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <FormControl>
                                                                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal bg-background", !field.value && "text-muted-foreground")}>
                                                                                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                        </Button>
                                                                                    </FormControl>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus/>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}/>
                                                                    <FormField control={form.control} name="practicalTest.location" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Location</FormLabel>
                                                                            <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. London Test Centre" className="bg-background" /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}/>
                                                                </fieldset>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                            <DialogFooter>
                                                <Button type="submit">Save changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <h3 className="text-lg font-semibold border-b pb-2">Contact & Personal Details</h3>
                            <div className="flex items-center gap-3 pt-2">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{pupil.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{pupil.phone}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Home className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className="text-sm">
                                    <p>{address.line1}</p>
                                    {address.line2 && <p>{address.line2}</p>}
                                    <p>{address.city}, {address.postcode}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <BookUser className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-mono">{pupil.licenceNumber}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <TestHistoryDisplay title="Theory Test" attempts={theoryTest} />
                            <TestHistoryDisplay title="Practical Test" attempts={practicalTest} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )

    
}

    
