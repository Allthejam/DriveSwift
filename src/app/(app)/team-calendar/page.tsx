
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lessons as initialLessons, pupils as allPupils, instructors as allInstructors } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isWithinInterval, addDays, startOfDay, endOfDay, parseISO, subDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const instructorColors = [
    'bg-sky-200', 'bg-green-200', 'bg-amber-200', 'bg-rose-200', 'bg-violet-200', 'bg-pink-200', 'bg-lime-200'
];

export default function TeamCalendarPage() {
    const searchParams = useSearchParams();
    const schoolId = searchParams.get('schoolId') || '1';

    const [weekStartDate, setWeekStartDate] = useState<Date | null>(null);
    const [allLessons, setAllLessons] = useState(initialLessons);
    const [instructors, setInstructors] = useState(allInstructors.filter(i => i.schoolId === schoolId));

    useEffect(() => {
        setWeekStartDate(startOfDay(new Date()));
        setInstructors(allInstructors.filter(i => i.schoolId === schoolId));
    }, [schoolId]);

    if (!weekStartDate) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Team Calendar</CardTitle>
                    <CardDescription>Loading calendar...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    const nextWeek = () => setWeekStartDate(addDays(weekStartDate, 7));
    const prevWeek = () => setWeekStartDate(subDays(weekStartDate, 7));
    const goToToday = () => setWeekStartDate(startOfDay(new Date()));

    const weekEndDate = endOfDay(addDays(weekStartDate, 6));

    const schoolInstructorIds = instructors.map(i => i.id);
    const schoolLessons = allLessons.filter(l => schoolInstructorIds.includes(l.instructorId));


    const upcomingLessons = schoolLessons
        .filter(lesson => isWithinInterval(parseISO(lesson.date), { start: weekStartDate, end: weekEndDate }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const lessonsByDay: { [key: string]: typeof allLessons } = {};

    upcomingLessons.forEach(lesson => {
        const day = format(parseISO(lesson.date), 'yyyy-MM-dd');
        if (!lessonsByDay[day]) {
            lessonsByDay[day] = [];
        }
        lessonsByDay[day].push(lesson);
    });
    
    const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStartDate, i), 'yyyy-MM-dd'));

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <CardTitle>Team Calendar</CardTitle>
                        <CardDescription>
                            Showing 7 days from {format(weekStartDate, 'do MMMM yyyy')}
                        </CardDescription>
                     </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold">Key:</h4>
                        {instructors.map((instructor, index) => (
                           <div key={instructor.id} className="flex items-center gap-2">
                               <div className={cn("h-4 w-4 rounded-full", instructorColors[index % instructorColors.length])}></div>
                               <span className="text-sm">{instructor.name.split(' ')[0]}</span>
                           </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {days.map(day => {
                        const dayLessons = lessonsByDay[day] || [];
                        const dateObj = parseISO(day);
                        return (
                            <div key={day} className="bg-muted/30 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-3 border-b pb-2">
                                     <h4 className="font-semibold text-sm">{format(dateObj, "EEEE")} <span className="text-muted-foreground font-normal">{format(dateObj, "do MMM")}</span></h4>
                                </div>
                               
                                {dayLessons.length > 0 ? (
                                    <div className="space-y-3">
                                        {dayLessons.map(lesson => {
                                            const pupil = allPupils.find(p => p.id === lesson.pupilId);
                                            const instructor = instructors.find(i => i.id === lesson.instructorId);
                                            const instructorIndex = instructors.findIndex(i => i.id === lesson.instructorId);
                                            const isBlocked = lesson.pupilId === 'instructor';
                                            
                                            return (
                                                <div key={lesson.id} className={cn("flex items-start gap-3 p-2 rounded-md border-l-4", instructorColors[instructorIndex % instructorColors.length])}>
                                                    <div className="w-12 text-sm text-center font-mono bg-background rounded-md p-1">
                                                        {format(parseISO(lesson.date), "HH:mm")}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-semibold text-sm truncate">{isBlocked ? lesson.title : pupil?.name}</p>
                                                        <p className="text-xs text-muted-foreground">{isBlocked ? `Blocked by ${instructor?.name.split(' ')[0]}` : `w/ ${instructor?.name.split(' ')[0]}`}</p>
                                                    </div>
                                                </div>
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
