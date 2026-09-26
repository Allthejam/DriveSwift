
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfDay, addMinutes, isSameDay, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, subMonths, addMonths, isBefore, startOfHour, isEqual, parseISO, differenceInMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Lesson, pupils, bookingRequests as initialBookingRequests, lessons as initialLessons, BookingRequest, instructorSettings, instructors } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface BookingCalendarProps {
    pupilId: string;
}

type TimeSlot = {
    date: Date;
    isBooked: boolean;
    isInPast: boolean;
};

const generateTimeSlots = (date: Date, lessons: Lesson[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    let currentTime = startOfHour(startOfDay(date));
    currentTime.setHours(8); // Start at 8 AM

    const endTime = startOfDay(date);
    endTime.setHours(20); // End at 8 PM
    
    const now = new Date();

    const isSlotBooked = (slot: Date) => {
        return lessons.some(lesson => {
            const lessonStart = parseISO(lesson.date);
            // Assuming 30min slots for lessons for now
            const lessonEnd = addMinutes(lessonStart, 30); 
            return isSameDay(slot, lessonStart) && slot >= lessonStart && slot < lessonEnd;
        });
    };

    while (currentTime < endTime) {
        const slotDate = new Date(currentTime);
        slots.push({
            date: slotDate,
            isBooked: isSlotBooked(slotDate),
            isInPast: isBefore(slotDate, now)
        });
        currentTime = addMinutes(currentTime, 30);
    }
    return slots;
};

export function BookingCalendar({ pupilId }: BookingCalendarProps) {
    const { toast } = useToast();
    const [lessons, setLessons] = useState(initialLessons);
    const [bookingRequests, setBookingRequests] = useState(initialBookingRequests);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(true);

    const pupil = pupils.find(p => p.id === pupilId);
    const instructor = instructors.find(i => i.id === pupil?.instructorId);

    useEffect(() => {
        setIsLoadingSlots(true);
        // Filter lessons for the pupil's instructor only
        const instructorLessons = initialLessons.filter(l => l.instructorId === instructor?.id);
        const clientTimeSlots = generateTimeSlots(selectedDate, instructorLessons);
        setTimeSlots(clientTimeSlots);
        setIsLoadingSlots(false);
        setSelectedSlots([]);
    }, [selectedDate, lessons, instructor]);

    const handleDateChange = (date: Date) => {
        const today = startOfDay(new Date());
        if (isBefore(date, today)) {
             toast({
                variant: 'destructive',
                title: 'Invalid Date',
                description: 'Cannot select a date in the past.',
            });
            return;
        }
        setSelectedDate(date);
    };

    const handleSlotClick = (slot: Date) => {
        setSelectedSlots(prevSlots => {
            const isSelected = prevSlots.some(s => isEqual(s, slot));
            if (isSelected) {
                return prevSlots.filter(s => !isEqual(s, slot));
            } else {
                return [...prevSlots, slot];
            }
        });
    };

    const handleSubmitRequest = () => {
        if (!pupil || !instructor) return;

        if (selectedSlots.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No slots selected',
                description: 'Please select one or more time slots to book.',
            });
            return;
        }

        // --- Start of validation logic ---
        const minDuration = instructor.settings.rules.minLessonDurationMinutes;
        const totalDuration = selectedSlots.length * 30;

        if (totalDuration < minDuration) {
             toast({
                variant: 'destructive',
                title: 'Minimum Lesson Duration',
                description: `Lessons must be at least ${minDuration} minutes long. Please select more slots.`,
            });
            return;
        }

        if (selectedSlots.length > 1) {
            const sortedSlots = [...selectedSlots].sort((a, b) => a.getTime() - b.getTime());
            
            for (let i = 0; i < sortedSlots.length - 1; i++) {
                const diff = differenceInMinutes(sortedSlots[i+1], sortedSlots[i]);
                if (diff !== 30) {
                    toast({
                        variant: 'destructive',
                        title: 'Non-consecutive slots selected',
                        description: 'Slots must be consecutive. Please select a continuous block of time or submit separate requests.',
                    });
                    return;
                }
            }
        }
        // --- End of validation logic ---


        const newBookingRequest: BookingRequest = {
            id: `br-${Date.now()}`,
            pupilId: pupilId,
            instructorId: instructor.id,
            requestedSlots: selectedSlots.map(s => s.toISOString()),
            status: 'pending',
        };

        const newProvisionalLessons: Lesson[] = selectedSlots.map((slot, index) => ({
            id: `l-prov-${Date.now()}-${index}`,
            pupilId: pupilId,
            instructorId: instructor.id,
            title: `Provisional - ${pupil.name}`,
            date: slot.toISOString(),
            status: 'provisional',
        }));

        setBookingRequests(prev => [...prev, newBookingRequest]);
        setLessons(prev => [...prev, ...newProvisionalLessons]);

        toast({
            title: 'Booking Request Sent!',
            description: `Your request for ${selectedSlots.length} slot(s) on ${format(selectedSlots[0], 'PPP')} has been sent to your instructor for confirmation.`,
        });

        setSelectedSlots([]);
    };

    const nextDay = () => handleDateChange(addDays(selectedDate, 1));
    const prevDay = () => handleDateChange(subDays(selectedDate, 1));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange(subMonths(selectedDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleDateChange(new Date())}>Today</Button>
                    <Button variant="outline" size="icon" onClick={() => handleDateChange(addMonths(selectedDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <WeekView selectedDate={selectedDate} onDateSelect={handleDateChange} />
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{format(selectedDate, 'EEEE, do MMMM')}</h3>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevDay}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextDay}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {isLoadingSlots ? (
                            Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : (
                            timeSlots.map(slot => {
                                const isSelected = selectedSlots.some(s => isEqual(s, slot.date));
                                const disabled = slot.isBooked || slot.isInPast;
                                const lesson = lessons.find(l => isSameDay(parseISO(l.date), slot.date) && format(parseISO(l.date), 'HH:mm') === format(slot.date, 'HH:mm'));

                                return (
                                    <Button
                                        key={slot.date.toISOString()}
                                        variant={isSelected ? 'default' : 'outline'}
                                        disabled={disabled}
                                        onClick={() => handleSlotClick(slot.date)}
                                        className={cn("h-12 flex flex-col items-start p-2", {
                                            "cursor-not-allowed bg-muted text-muted-foreground": disabled && !isSelected,
                                            "hover:bg-primary/10 hover:border-primary": !disabled && !isSelected,
                                            "ring-2 ring-primary-focus": isSelected,
                                            "bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed": lesson?.status === 'provisional'
                                        })}
                                    >
                                        <span className="font-semibold">{format(slot.date, 'HH:mm')}</span>
                                        {slot.isBooked && <span className="text-xs text-muted-foreground">{lesson?.status === 'provisional' ? 'Pending' : 'Booked'}</span>}
                                    </Button>
                                );
                            })
                        )}
                    </div>
                </div>
                 <div className="mt-6 pt-6 border-t">
                    <Button 
                        onClick={handleSubmitRequest} 
                        disabled={selectedSlots.length === 0}
                        className="w-full"
                    >
                        Submit Request for {selectedSlots.length} Slot(s)
                    </Button>
                 </div>
            </CardContent>
        </Card>
    );
}


function WeekView({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (date: Date) => void }) {
    const monthStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const monthEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map(day => (
                <Button 
                    key={day.toISOString()} 
                    variant={isSameDay(day, selectedDate) ? 'default' : 'outline'}
                    onClick={() => onDateSelect(day)}
                    className="flex flex-col h-auto p-2"
                >
                    <span className="text-xs">{format(day, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(day, 'd')}</span>
                </Button>
            ))}
        </div>
    )
}
