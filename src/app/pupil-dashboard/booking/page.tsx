import { BookingCalendar } from "./booking-calendar";
import { pupils } from "@/lib/data";

export default function BookingPage() {
    // For this prototype, we'll assume the logged in pupil is the first one.
    const pupil = pupils[0];

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Book a Lesson</h1>
                <p className="text-muted-foreground">Select one or more available time slots to request a new lesson.</p>
            </div>
            <BookingCalendar pupilId={pupil.id} />
        </div>
    )
}
