
'use server';

import { Suspense } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardPageContent from './dashboard-client-page';

export default async function DashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const instructorId = typeof searchParams.instructorId === 'string' ? searchParams.instructorId : undefined;
    const schoolId = typeof searchParams.schoolId === 'string' ? searchParams.schoolId : undefined;
    const isSuperAdmin = instructorId === 'super-admin';

    let props: any = { isSuperAdmin };

    if (isSuperAdmin) {
        props.initialSignupRequests = initialSignupRequests.filter(r => r.status === 'pending');
        props.schoolCount = initialSchools.length;
        props.totalPupils = allPupils.length;
        const start = startOfDay(new Date());
        const end = endOfDay(addDays(new Date(), 6));
        props.totalLessonsThisWeek = initialLessons.filter(l => l.status !== 'provisional' && isWithinInterval(parseISO(l.date), {start, end})).length;
    } else if (instructorId && schoolId) {
        const currentInstructor = initialInstructors.find(i => i.id === instructorId);
        if (currentInstructor) {
            props.instructor = currentInstructor;
            props.schoolId = schoolId;
            const schoolInstructors = initialInstructors.filter(i => i.schoolId === schoolId);
            const schoolInstructorIds = schoolInstructors.map(i => i.id);

            props.initialPupils = allPupils.filter(p => schoolInstructorIds.includes(p.instructorId));
            
            const relevantRequests = initialBookingRequests.filter(r => schoolInstructorIds.includes(r.instructorId) && r.status === 'pending');
            props.initialBookingRequests = relevantRequests;

            const provisionalLessons: Lesson[] = relevantRequests.flatMap(req => {
                const pupil = allPupils.find(p => p.id === req.pupilId);
                return req.requestedSlots.map((slot, index) => ({
                    id: `prov-${req.id}-${index}`,
                    pupilId: req.pupilId,
                    instructorId: req.instructorId,
                    title: `Provisional - ${pupil?.name}`,
                    date: slot,
                    status: 'provisional',
                }));
            });
            
            const relevantLessons = initialLessons.filter(l => schoolInstructorIds.includes(l.instructorId));
            props.initialLessons = [...relevantLessons, ...provisionalLessons];
        } else {
            props.error = "Instructor not found.";
        }
    } else if (!isSuperAdmin) {
        props.error = "Instructor or school ID is missing or invalid.";
    }

    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPageContent {...props} />
        </Suspense>
    );
}


function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
            <Skeleton className="h-96 w-full" />
        </div>
    );
}
