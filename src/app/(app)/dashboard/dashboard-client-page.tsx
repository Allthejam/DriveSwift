
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lessons as initialLessons, pupils as allPupils, bookingRequests as initialBookingRequests, type BookingRequest, type Lesson, instructors as initialInstructors, type Pupil, lessonFeedback, schools as initialSchools, appIssues, type AppIssue, signupRequests as initialSignupRequests, type SignupRequest, type Instructor, deniedSignupRequests, contactSubmissions, Reply, schools } from "@/lib/data";
import { Check, ChevronLeft, ChevronRight, MessageSquareQuote, ThumbsDown, ThumbsUp, PlusCircle, NotebookText, UserPlus, Bug, Siren, ArrowRight, CheckCircle, XCircle, AlertCircle, Sparkles, Inbox, Send, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format, isWithinInterval, addDays, startOfDay, endOfDay, parseISO, subDays, isPast, differenceInDays } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";


function RecentFeedback({ instructorId, schoolId }: { instructorId: string, schoolId: string }) {
    const schoolInstructors = initialInstructors.filter(i => i.schoolId === schoolId);
    const schoolInstructorIds = schoolInstructors.map(i => i.id);

    const instructorPupilIds = allPupils.filter(p => schoolInstructorIds.includes(p.instructorId)).map(p => p.id);
    const recentFeedback = lessonFeedback
        .filter(fb => instructorPupilIds.includes(fb.pupilId))
        .slice(0, 3);

    if (recentFeedback.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-4">
                <MessageSquareQuote className="mx-auto h-8 w-8 mb-2" />
                <p>No recent feedback from pupils.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {recentFeedback.map((fb) => {
                const pupil = allPupils.find(p => p.id === fb.pupilId);
                const lesson = initialLessons.find(l => l.id === fb.lessonId);
                return (
                    <Dialog key={fb.lessonId}>
                        <DialogTrigger asChild>
                            <button className="flex w-full text-left items-start gap-4 p-2 rounded-lg hover:bg-muted">
                                <Avatar>
                                    <AvatarImage src={pupil?.avatarUrl || `https://placehold.co/100x100.png?text=${pupil?.avatar}`} data-ai-hint="person portrait" />
                                    <AvatarFallback>{pupil?.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold">{pupil?.name}</p>
                                    <p className="text-sm text-muted-foreground">{fb.workedWell}</p>
                                </div>
                                <div className="self-center">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Feedback from {pupil?.name}</DialogTitle>
                                {lesson && (
                                     <DialogDescription>
                                        For lesson: {lesson.title} on {format(parseISO(lesson.date), "do MMM yyyy")}
                                    </DialogDescription>
                                )}
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label className="font-semibold">What worked well?</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{fb.workedWell}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">What did you struggle with?</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{fb.struggledWith}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">What would you like to do more of?</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{fb.doMoreOf}</p>
                                </div>
                                {fb.generalFeedback && (
                                    <div>
                                        <Label className="font-semibold">General Feedback</Label>
                                        <p className="text-sm text-muted-foreground mt-1">{fb.generalFeedback}</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            })}
        </div>
    )
}

function BookingRequests({ bookingRequests, onApprove }: { bookingRequests: BookingRequest[], onApprove: (requestId: string) => void }) {
    if (bookingRequests.length === 0) {
        return (
             <div className="text-center text-muted-foreground py-4">
                <Check className="mx-auto h-8 w-8 mb-2" />
                <p>No pending lesson requests.</p>
            </div>
        )
    }
    return (
        <div className="space-y-3">
            {bookingRequests.map((req) => {
                 const pupil = allPupils.find(p => p.id === req.pupilId);
                 const firstSlot = req.requestedSlots[0];
                 const dateDisplay = req.requestedSlots.length > 1 
                    ? `${format(parseISO(firstSlot), "do MMM yyyy")} (${req.requestedSlots.length} slots)`
                    : format(parseISO(firstSlot), "do MMM yyyy 'at' HH:mm");

                 return (
                    <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={pupil?.avatarUrl || `https://placehold.co/100x100.png?text=${pupil?.avatar}`} data-ai-hint="person portrait" />
                            <AvatarFallback>{pupil?.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-sm truncate">{pupil?.name}</p>
                                <p className="text-xs text-muted-foreground">{dateDisplay}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                           <Button size="icon" variant="outline" className="h-8 w-full sm:w-8 bg-green-100 text-green-700 hover:bg-green-200" onClick={() => onApprove(req.id)}>
                                <ThumbsUp className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="outline" className="h-8 w-full sm:w-8 bg-red-100 text-red-700 hover:bg-red-200">
                                <ThumbsDown className="h-4 w-4" />
                           </Button>
                        </div>
                    </div>
                 )
            })}
        </div>
    )
}


function AddPupilDialog({ instructorId, onPupilAdded, onOpenChange }: { instructorId: string, onPupilAdded: (newPupil: Pupil) => void, onOpenChange: (open: boolean) => void }) {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;

        const newPupil: Pupil = {
            id: `pupil-${Date.now()}`,
            instructorId: instructorId,
            name,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            avatar: name.split(' ').map(n => n[0]).join(''),
            // Add default empty details for a new pupil
            address: { line1: '', city: '', postcode: '' },
            licenceNumber: '',
            theoryTest: [{ status: 'Not Booked', date: null }],
            practicalTest: [{ status: 'Not Booked', date: null }],
            progress: { manoeuvres: 0, junctions: 0, roundabouts: 0, dualCarriageway: 0, independentDriving: 0 }
        };
        
        allPupils.push(newPupil); // Simulate adding to DB
        onPupilAdded(newPupil);
        onOpenChange(false);
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Pupil</DialogTitle>
                <DialogDescription>
                    Enter the details for the new pupil. You can add more details later from their profile page.
                </DialogDescription>
            </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required />
                </div>
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" />
                </div>
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" />
                </div>
                <DialogFooter>
                    <Button type="submit">Add Pupil</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}


function AddEventForm({ onAddEvent, selectedDate, instructorId, schoolId, onPupilAdded }: { onAddEvent: (event: Lesson) => void, selectedDate: Date, instructorId: string, schoolId: string, onPupilAdded: (newPupil: Pupil) => void }) {
    const [eventType, setEventType] = useState<'lesson' | 'blocked'>('lesson');
    const [lessonType, setLessonType] = useState('Standard Lesson');
    const [pupilId, setPupilId] = useState<string>('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [isAddPupilOpen, setIsAddPupilOpen] = useState(false);
    
    const schoolInstructors = initialInstructors.filter(i => i.schoolId === schoolId);
    const schoolInstructorIds = schoolInstructors.map(i => i.id);
    const schoolPupils = allPupils.filter(p => schoolInstructorIds.includes(p.instructorId));

    const handlePupilSelect = (value: string) => {
        if (value === 'add-new-pupil') {
            setIsAddPupilOpen(true);
        } else {
            setPupilId(value);
        }
    }

    const handleNewPupilAdded = (newPupil: Pupil) => {
        onPupilAdded(newPupil);
        setPupilId(newPupil.id);
        setIsAddPupilOpen(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const [hours, minutes] = startTime.split(':').map(Number);
        const eventDate = new Date(selectedDate);
        eventDate.setHours(hours, minutes);

        let eventTitle = '';
        if (eventType === 'lesson') {
            const pupil = allPupils.find(p => p.id === pupilId);
            eventTitle = `${pupil?.name} - ${lessonType}`;
        } else {
            eventTitle = title;
        }

        const newEvent: Lesson = {
            id: `evt-${Date.now()}`,
            pupilId: eventType === 'lesson' ? pupilId : 'instructor',
            instructorId: instructorId,
            title: eventTitle,
            date: eventDate.toISOString()
        };

        onAddEvent(newEvent);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select onValueChange={(value: 'lesson' | 'blocked') => setEventType(value)} defaultValue={eventType}>
                    <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lesson">Lesson / Test</SelectItem>
                        <SelectItem value="blocked">Block Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {eventType === 'lesson' ? (
                <>
                    <div>
                        <Label htmlFor="pupil">Pupil</Label>
                        <Select onValueChange={handlePupilSelect} value={pupilId}>
                            <SelectTrigger id="pupil">
                                <SelectValue placeholder="Select a pupil" />
                            </SelectTrigger>
                            <SelectContent>
                                {schoolPupils.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                <SelectItem value="add-new-pupil">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" /> Add New Pupil...
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="lessonType">Lesson Type</Label>
                        <Select onValueChange={setLessonType} defaultValue={lessonType}>
                            <SelectTrigger id="lessonType">
                                <SelectValue placeholder="Select lesson type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="First Lesson">First Lesson</SelectItem>
                                <SelectItem value="Standard Lesson">Standard Lesson</SelectItem>
                                <SelectItem value="Mock Test">Mock Test</SelectItem>
                                <SelectItem value="Driving Test">Driving Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            ) : (
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Personal Appointment" required />
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Date</Label>
                    <Input value={format(selectedDate, 'PPP')} disabled />
                </div>
                <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
            </div>

            <DialogFooter>
                <Button type="submit">Add Event</Button>
            </DialogFooter>
             <Dialog open={isAddPupilOpen} onOpenChange={setIsAddPupilOpen}>
                 <AddPupilDialog instructorId={instructorId} onPupilAdded={handleNewPupilAdded} onOpenChange={setIsAddPupilOpen} />
            </Dialog>
        </form>
    )
}

function DailyPlanner({ lessons, onAddEvent, instructorId, schoolId, onPupilAdded }: { lessons: Lesson[], onAddEvent: (event: Lesson) => void, instructorId: string, schoolId: string, onPupilAdded: (newPupil: Pupil) => void }) {
    const [weekStartDate, setWeekStartDate] = useState(startOfDay(new Date()));
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedDayForAdd, setSelectedDayForAdd] = useState(new Date());


    const nextWeek = () => setWeekStartDate(addDays(weekStartDate, 7));
    const prevWeek = () => setWeekStartDate(subDays(weekStartDate, 7));
    const goToToday = () => setWeekStartDate(startOfDay(new Date()));

    const weekEndDate = endOfDay(addDays(weekStartDate, 6));

    const upcomingLessons = lessons
        .filter(lesson => isWithinInterval(parseISO(lesson.date), { start: weekStartDate, end: weekEndDate }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const lessonsByDay: { [key: string]: typeof lessons } = {};

    upcomingLessons.forEach(lesson => {
        const day = format(parseISO(lesson.date), 'yyyy-MM-dd');
        if (!lessonsByDay[day]) {
            lessonsByDay[day] = [];
        }
        lessonsByDay[day].push(lesson);
    });
    
    const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStartDate, i), 'yyyy-MM-dd'));

    const handleAddEvent = (event: Lesson) => {
        onAddEvent(event);
        setIsAddOpen(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <CardTitle>Your Planner</CardTitle>
                        <CardDescription>
                            Showing 7 days from {format(weekStartDate, 'do MMMM yyyy')}
                        </CardDescription>
                     </div>
                    <div className="flex items-center gap-2">
                         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add a New Calendar Event</DialogTitle>
                                    <DialogDescription>Add a lesson for a pupil or block out personal time.</DialogDescription>
                                </DialogHeader>
                                <AddEventForm onAddEvent={handleAddEvent} selectedDate={selectedDayForAdd} instructorId={instructorId} schoolId={schoolId} onPupilAdded={onPupilAdded} />
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                        <Button variant="outline" size="icon" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {days.map(day => {
                        const dayLessons = lessonsByDay[day] || [];
                        const dateObj = parseISO(day);
                        return (
                            <div key={day} className="bg-muted/30 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-3 border-b pb-2">
                                     <h4 className="font-semibold text-sm">{format(dateObj, "EEEE")} <span className="text-muted-foreground font-normal">{format(dateObj, "do MMM")}</span></h4>
                                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedDayForAdd(dateObj); setIsAddOpen(true); }}><PlusCircle className="h-4 w-4" /></Button>
                                </div>
                               
                                {dayLessons.length > 0 ? (
                                    <div className="space-y-3">
                                        {dayLessons.map(lesson => {
                                            const pupil = allPupils.find(p => p.id === lesson.pupilId);
                                            const isBlocked = lesson.pupilId === 'instructor';
                                            const lessonIsInPast = isPast(parseISO(lesson.date));
                                            const linkHref = `/pupils/${pupil?.id}?instructorId=${instructorId}`;

                                            if (lessonIsInPast && !isBlocked) {
                                                 if (lesson.notes) {
                                                    return (
                                                        <Button key={lesson.id} variant="secondary" disabled className="w-full h-auto text-wrap p-2 justify-between">
                                                             <div>
                                                                <p className="font-semibold">{pupil?.name}</p>
                                                                <p className="text-xs text-muted-foreground text-left">{format(parseISO(lesson.date), "HH:mm")}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <span className="text-xs">Note Complete</span>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                        </Button>
                                                    )
                                                 }
                                                return (
                                                    <Button key={lesson.id} asChild variant="secondary" className="w-full h-auto text-wrap p-2 justify-between">
                                                        <Link href={linkHref}>
                                                            <div>
                                                                <p className="font-semibold">{pupil?.name}</p>
                                                                <p className="text-xs text-muted-foreground text-left">{format(parseISO(lesson.date), "HH:mm")}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs">Leave Note</span>
                                                                <NotebookText className="h-4 w-4" />
                                                            </div>
                                                        </Link>
                                                    </Button>
                                                )
                                            }

                                            return (
                                                <Link href={isBlocked ? '#' : linkHref} key={lesson.id} className="flex items-start gap-3 hover:bg-background p-2 rounded-md">
                                                    <div className="w-12 text-sm text-center font-mono bg-background rounded-md p-1">
                                                        {format(parseISO(lesson.date), "HH:mm")}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-semibold text-sm truncate">{isBlocked ? lesson.title : lesson.title}</p>
                                                        <p className="text-xs text-muted-foreground">{lesson.status === 'provisional' ? 'Provisional' : (isBlocked ? 'Blocked' : 'Lesson')}</p>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No lessons</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

function PendingApprovals({ signupRequests, onApprove, onDeny }: { signupRequests: SignupRequest[], onApprove: (requestId: string) => void, onDeny: (requestId: string) => void }) {
    if (signupRequests.length === 0) {
        return null;
    }
    
    return (
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
                            <p className="text-sm"><span className="font-semibold">Address:</span> {req.address.line1}, {req.address.city}, {req.address.postcode}</p>
                            <div className="flex flex-col gap-2 w-full pt-2">
                                <div className="flex gap-2 w-full">
                                    <Button className="w-full" onClick={() => onApprove(req.id)} size="sm">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button className="w-full" onClick={() => onDeny(req.id)} variant="destructive" size="sm">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deny
                                    </Button>
                                </div>
                                <Button asChild className="w-full" variant="secondary" size="sm">
                                    <Link href="https://finddrivinginstructor.dvsa.gov.uk/DSAFindNearestWebApp/findNearest.form?lang=en" target="_blank">
                                        Check DVSA Number
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    )
}


function StatusAlert({ status }: { status: Instructor['status'] }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status === 'pending') {
            setIsVisible(true);
        } else if (status === 'approved') {
            // Check session storage to see if we've shown the message before
            const hasSeenApproval = sessionStorage.getItem('hasSeenApproval');
            if (!hasSeenApproval) {
                setIsVisible(true);
                sessionStorage.setItem('hasSeenApproval', 'true');
            }
        }
    }, [status]);


    if (!isVisible) return null;

    if (status === 'pending') {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Account Pending Approval</AlertTitle>
                <AlertDescription>
                    Your account is currently under review. You can use the app, but some features may be limited. We will notify you once your account is approved.
                </AlertDescription>
            </Alert>
        )
    }

    if (status === 'approved') {
        return (
            <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Account Approved!</AlertTitle>
                <AlertDescription className="text-green-700">
                    Welcome aboard! Your account is now fully active.
                </AlertDescription>
            </Alert>
        )
    }

    return null;
}


function SubscriptionStatus({ instructor }: { instructor: Instructor }) {
    const { subscriptionStatus, subscriptionTier, trialEndDate, accountType } = instructor;
    
    if (subscriptionStatus === 'free' && accountType === 'PDI') {
        return (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2"><Sparkles className="h-5 w-5"/>Free PDI Account</CardTitle>
                    <CardDescription className="text-blue-700">
                        Enjoy free access to core features to help you get started on your journey to becoming an ADI. Good luck!
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    if (subscriptionStatus === 'trial' && trialEndDate) {
        const daysRemaining = differenceInDays(parseISO(trialEndDate), new Date());

        if (daysRemaining >= 0) {
            return (
                 <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2"><Sparkles className="h-5 w-5"/>Welcome to your Free Trial!</CardTitle>
                        <CardDescription className="text-primary/80">
                            You have <span className="font-bold">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span> remaining in your trial of the <strong>Standard Plan</strong>.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )
        }
    }

    return null; // Don't show anything for active, paid accounts for now
}

function InboxCard({ instructor }: { instructor: Instructor }) {
    const [messages, setMessages] = useState(contactSubmissions.filter(cs => cs.email.toLowerCase() === instructor.email.toLowerCase()));
    const [selectedMessage, setSelectedMessage] = useState(messages[0] || null);
    const [replyText, setReplyText] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setMessages(contactSubmissions.filter(cs => cs.email.toLowerCase() === instructor.email.toLowerCase()));
    }, [instructor.email]);

    const handleMessageSelect = (messageId: string) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            // Mark replies as read
            message.replies?.forEach(r => { if (r.from === 'Super Admin') r.isRead = true });
            setSelectedMessage(message);
        }
    }
    
    const handleReply = () => {
        if (!selectedMessage || !replyText.trim()) return;

        const newReply: Reply = {
            from: 'Instructor',
            message: replyText,
            date: new Date().toISOString(),
            isRead: false
        };

        const messageIndex = contactSubmissions.findIndex(m => m.id === selectedMessage.id);
        if (messageIndex > -1) {
            if (!contactSubmissions[messageIndex].replies) {
                contactSubmissions[messageIndex].replies = [];
            }
            contactSubmissions[messageIndex].replies?.push(newReply);
            setMessages([...contactSubmissions.filter(cs => cs.email.toLowerCase() === instructor.email.toLowerCase())]);
            setSelectedMessage(contactSubmissions[messageIndex]);
            setReplyText('');
            toast({ title: 'Reply Sent!' });
        }
    }

    const unreadCount = messages.reduce((count, msg) => {
        return count + (msg.replies?.filter(r => r.from === 'Super Admin' && !r.isRead).length || 0);
    }, 0);

    if (messages.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Messages from DriveSwift Admin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-4">
                        <Inbox className="mx-auto h-8 w-8 mb-2" />
                        <p>You have no messages.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Inbox
                    {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
                </CardTitle>
                <CardDescription>Messages from DriveSwift Admin.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <ScrollArea className="h-96 pr-3">
                            <div className="space-y-2">
                                {messages.map(msg => {
                                    const hasUnread = msg.replies?.some(r => r.from === 'Super Admin' && !r.isRead);
                                    return (
                                        <button key={msg.id} onClick={() => handleMessageSelect(msg.id)} className={cn("w-full text-left p-3 rounded-lg transition-colors", selectedMessage?.id === msg.id ? "bg-primary/10" : "hover:bg-muted/50")}>
                                            <div className="flex justify-between items-start">
                                                <p className={cn("font-semibold text-sm", hasUnread && "font-bold")}>{msg.subject}</p>
                                                {hasUnread && <span className="h-2 w-2 rounded-full bg-primary mt-1"></span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="md:col-span-2">
                        {selectedMessage ? (
                            <div className="flex flex-col h-96">
                                <ScrollArea className="flex-grow rounded-md border p-4 mb-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-start gap-2">
                                            <div className="rounded-lg bg-muted p-3">
                                                <p className="text-sm font-semibold mb-1">{selectedMessage.subject}</p>
                                                <p className="text-sm">{selectedMessage.message}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{selectedMessage.name} - {format(new Date(selectedMessage.date), 'PP p')}</p>
                                        </div>
                                        {(selectedMessage.replies || []).map((reply, index) => (
                                            <div key={index} className={cn("flex flex-col gap-2", reply.from === 'Instructor' ? 'items-end' : 'items-start')}>
                                                <div className={cn("rounded-lg p-3", reply.from === 'Instructor' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                    <p className="text-sm">{reply.message}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{reply.from} - {format(new Date(reply.date), 'PP p')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                 <div className="flex gap-2">
                                    <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." />
                                    <Button onClick={handleReply} size="icon" className="h-auto px-4"><Send/></Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-96 flex items-center justify-center text-muted-foreground">
                                <p>Select a message to view.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function DashboardPageContent({
    isSuperAdmin,
    instructor,
    schoolId,
    initialLessons = [],
    initialPupils = [],
    initialBookingRequests = [],
    initialSignupRequests = [],
    schoolCount = 0,
    totalPupils = 0,
    totalLessonsThisWeek = 0,
    error,
}: {
    isSuperAdmin: boolean;
    instructor?: Instructor;
    schoolId?: string;
    initialLessons?: Lesson[];
    initialPupils?: Pupil[];
    initialBookingRequests?: BookingRequest[];
    initialSignupRequests?: SignupRequest[];
    schoolCount?: number;
    totalPupils?: number;
    totalLessonsThisWeek?: number;
    error?: string;
}) {
    const { toast } = useToast();
    
    const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
    const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialBookingRequests);
    const [pupils, setPupils] = useState<Pupil[]>(initialPupils);
    const [signupRequests, setSignupRequests] = useState<SignupRequest[]>(initialSignupRequests);
    
    const handleApproveRequest = (requestId: string) => {
        const request = bookingRequests.find(r => r.id === requestId);
        if (!request) return;

        const pupil = allPupils.find(p => p.id === request.pupilId);
        if (!pupil) return;

        setLessons(prevLessons => prevLessons.filter(l => l.status !== 'provisional' || !request.requestedSlots.includes(l.date)));
        
        setBookingRequests(prevRequests => prevRequests.filter(r => r.id !== requestId));
        
        const originalRequest = initialBookingRequests.find(r => r.id === requestId);
        if (originalRequest) originalRequest.status = 'approved';

        toast({
            title: "Lesson Booked!",
            description: `Lesson with ${pupil.name} on ${format(parseISO(request.requestedSlots[0]), "do MMM")} has been confirmed.`
        });
    };

    const handleAddEvent = (event: Lesson) => {
        setLessons(prev => [...prev, event]);
        toast({
            title: "Event Added",
            description: `${event.title} has been added to your calendar.`
        });
    }

    const handlePupilAdded = (newPupil: Pupil) => {
        setPupils(prev => [...prev, newPupil]);
         toast({
            title: "Pupil Added",
            description: `${newPupil.name} has been added to your pupil list.`
        });
    }
    
    const handleApproveSchool = (requestId: string) => {
        const request = signupRequests.find(r => r.id === requestId);
        if (!request) return;

        const instructorToApprove = initialInstructors.find(i => i.email === request.email);
        if (instructorToApprove) {
            instructorToApprove.status = 'approved';
        }

        setSignupRequests(prev => prev.filter(r => r.id !== requestId));

        const requestIndex = initialSignupRequests.findIndex(r => r.id === requestId);
        if(requestIndex > -1) initialSignupRequests[requestIndex].status = 'approved';
        
        toast({
            title: "School Approved",
            description: `${request.schoolName} is now active on the platform.`,
        });
    };

    const handleDenySchool = (requestId: string) => {
        const request = signupRequests.find(r => r.id === requestId);
        if (!request) return;

        const instructorToDeny = initialInstructors.find(i => i.email === request.email);
        if (instructorToDeny) {
            instructorToDeny.status = 'denied';
        }

        deniedSignupRequests.push({ ...request, status: 'denied' });
        
        setSignupRequests(prev => prev.filter(r => r.id !== requestId));
        
        const requestIndex = initialSignupRequests.findIndex(r => r.id === requestId);
        if(requestIndex > -1) initialSignupRequests.splice(requestIndex, 1);

        toast({
            variant: "destructive",
            title: "School Denied",
            description: `${request.schoolName} has been denied and logged.`,
        });
    };

    if (error) {
         return (
            <div className="flex justify-center items-center h-full p-8">
                 <div className="space-y-6 text-center max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold">Could not load dashboard</h2>
                    <p className="text-muted-foreground">{error} Please check the URL or try logging in again.</p>
                    <Button asChild><Link href="/login">Return to Login</Link></Button>
                 </div>
            </div>
        )
    }

    if (isSuperAdmin) {
        return (
             <div className="space-y-6">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Platform Quick Stats</CardTitle>
                        <CardDescription className="text-primary-foreground/80">An overview of all schools.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-primary-foreground/10 rounded-lg flex-1">
                           <p className="text-3xl font-bold">{schoolCount}</p>
                           <p className="text-sm">Active Schools</p>
                        </div>
                        <div className="p-4 bg-primary-foreground/10 rounded-lg flex-1">
                            <p className="text-3xl font-bold">{totalPupils}</p>
                            <p className="text-sm">Total Pupils</p>
                        </div>
                         <div className="p-4 bg-primary-foreground/10 rounded-lg flex-1">
                           <p className="text-3xl font-bold">{totalLessonsThisWeek}</p>
                           <p className="text-sm">Lessons this week</p>
                        </div>
                    </CardContent>
                </Card>
                <PendingApprovals signupRequests={signupRequests} onApprove={handleApproveSchool} onDeny={handleDenySchool} />
            </div>
        )
    }

    if (!instructor || !schoolId) {
         return (
            <div className="flex justify-center items-center h-full p-8">
                 <div className="space-y-6 text-center max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold">Could not load dashboard</h2>
                    <p className="text-muted-foreground">The instructor or school ID is missing or invalid. Please check the URL or try logging in again.</p>
                    <Button asChild><Link href="/login">Return to Login</Link></Button>
                 </div>
            </div>
        )
    }

    const start = startOfDay(new Date());
    const end = endOfDay(addDays(new Date(), 6));
    const lessonsThisWeek = lessons.filter(l => l.status !== 'provisional' && isWithinInterval(parseISO(l.date), {start, end})).length;

    return (
        <div className="space-y-6">
            <StatusAlert status={instructor.status} />
            <SubscriptionStatus instructor={instructor} />
            <DailyPlanner lessons={lessons} onAddEvent={handleAddEvent} instructorId={instructor.id} schoolId={schoolId} onPupilAdded={handlePupilAdded} />
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                        <CardDescription>Latest messages from your pupils.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentFeedback instructorId={instructor.id} schoolId={schoolId}/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Requests</CardTitle>
                        <CardDescription>Approve or decline new lesson requests.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <BookingRequests bookingRequests={bookingRequests} onApprove={handleApproveRequest} />
                    </CardContent>
                </Card>
                 <Card className="md:col-span-1 bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Your school's weekly glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4 text-center">
                        <div className="p-4 bg-primary-foreground/10 rounded-lg flex-1">
                           <p className="text-3xl font-bold">{lessonsThisWeek}</p>
                           <p className="text-sm">Lessons this week</p>
                        </div>
                        <div className="p-4 bg-primary-foreground/10 rounded-lg flex-1">
                           <p className="text-3xl font-bold">{pupils.length}</p>
                           <p className="text-sm">Active Pupils</p>
                        </div>
                    </CardContent>
                </Card>
                <InboxCard instructor={instructor} />
            </div>
        </div>
    )
}
