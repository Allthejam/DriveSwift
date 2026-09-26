
"use client"

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lessons as initialLessons, pupils as initialPupils, TestAttempt, type Pupil, type Lesson, lessonPlans, lessonFeedback, LessonFeedback, LessonPlan, saveLessonPlan } from "@/lib/data";
import { Mail, Phone, Calendar as CalendarIcon, Home, BookUser, Award, MapPin, History, Save, NotebookPen, CheckCircle, XCircle, Lightbulb, MessageSquareQuote, NotebookText, Edit } from "lucide-react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, isPast, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Booked': 'default',
    'Passed': 'secondary',
    'Failed': 'destructive',
    'Not Booked': 'outline'
};


function TestInfoCard({ title, test }: { title: string, test: TestAttempt }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <Badge variant={statusColors[test.status]}>{test.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
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
                           <Card key={index} className="bg-muted/50">
                             <CardHeader className="p-4">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>{`${title} (Attempt ${previousAttempts.length - index})`}</span>
                                    <Badge variant={statusColors[attempt.status]}>{attempt.status}</Badge>
                                </CardTitle>
                            </CardHeader>
                             <CardContent className="p-4 pt-0 space-y-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{attempt.date ? new Date(attempt.date).toLocaleDateString('en-GB') : 'Not booked'}</span>
                                </div>
                            </CardContent>
                           </Card>
                        ))}
                     </div>
                </div>
            )}
        </div>
    )
}

function AddNoteDialog({ lesson, onSaveNote, children }: { lesson: Lesson, onSaveNote: (lessonId: string, note: string) => void, children: React.ReactNode }) {
    const [note, setNote] = useState(lesson.notes || "");
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSaveNote(lesson.id, note);
        setIsOpen(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
               {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Note for Lesson</DialogTitle>
                    <DialogDescription>
                        {lesson.title} on {new Date(lesson.date).toLocaleDateString('en-GB')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="lesson-note">Lesson Notes</Label>
                    <Textarea 
                        id="lesson-note" 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Worked on hill starts, pupil struggled with clutch control initially but improved..."
                        className="mt-2 min-h-[150px]"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Note</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


type LessonDetailProps = {
    lesson: Lesson;
    plan: LessonPlan | undefined;
    feedback: LessonFeedback | undefined;
    onPlanSave: (lessonId: string, plan: string) => void;
}

function InstructorLessonDialog({ lesson, plan, feedback, onPlanSave }: LessonDetailProps) {
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [planContent, setPlanContent] = useState(plan?.plan || "");

    useEffect(() => {
        setPlanContent(plan?.plan || "");
        setIsEditingPlan(false);
    }, [plan]);

    const handleSavePlan = () => {
        onPlanSave(lesson.id, planContent);
        setIsEditingPlan(false);
    }
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{lesson.title}</DialogTitle>
                <DialogDescription>
                    {format(parseISO(lesson.date), "EEEE, d MMMM yyyy")}
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="plan" className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="plan"><Lightbulb className="mr-2 h-4 w-4" />Lesson Plan</TabsTrigger>
                    <TabsTrigger value="notes"><NotebookText className="mr-2 h-4 w-4" />Instructor Notes</TabsTrigger>
                    <TabsTrigger value="feedback"><MessageSquareQuote className="mr-2 h-4 w-4" />Pupil Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                     <div className="relative h-80">
                        <div className="absolute top-0 right-0 z-10">
                             {isEditingPlan ? (
                                <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditingPlan(false)} className="mr-2">Cancel</Button>
                                <Button size="sm" onClick={handleSavePlan}><Save className="mr-2 h-4 w-4"/>Save</Button>
                                </>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => setIsEditingPlan(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {plan ? 'Edit Plan' : 'Add Plan'}
                                </Button>
                            )}
                        </div>
                        {isEditingPlan ? (
                            <Textarea 
                                value={planContent}
                                onChange={e => setPlanContent(e.target.value)}
                                className="h-full w-full"
                                placeholder="Enter your lesson plan here..."
                            />
                        ) : plan ? (
                            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4 h-full overflow-y-auto">
                                {plan.plan}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground h-full flex items-center justify-center">
                                <p>No lesson plan was created for this lesson.</p>
                            </div>
                        )}
                     </div>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                     {lesson.notes ? (
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4 h-80 overflow-y-auto">
                            {lesson.notes}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground h-80 flex items-center justify-center">
                            <p>You have not added any notes for this lesson yet.</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="feedback" className="mt-4">
                    {feedback ? (
                        <Card className="bg-muted/30 h-80 overflow-y-auto">
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">What worked well?</Label>
                                    <p className="text-sm">{feedback.workedWell}</p>
                                </div>
                                    <div>
                                    <Label className="text-xs text-muted-foreground">What did they struggle with?</Label>
                                    <p className="text-sm">{feedback.struggledWith}</p>
                                </div>
                                    <div>
                                    <Label className="text-xs text-muted-foreground">What would they like to do more of?</Label>
                                    <p className="text-sm">{feedback.doMoreOf}</p>
                                </div>
                                {feedback.generalFeedback && (
                                        <div>
                                        <Label className="text-xs text-muted-foreground">General Feedback</Label>
                                        <p className="text-sm">{feedback.generalFeedback}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="text-center py-8 text-muted-foreground h-80 flex items-center justify-center">
                            <p>The pupil has not submitted feedback for this lesson.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}

export default function PupilDetailPage() {
    const { toast } = useToast();
    const params = useParams();
    const searchParams = useSearchParams();
    const pupilId = params.id as string;

    const [pupil, setPupil] = useState<Pupil | undefined>(undefined);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [plans, setPlans] = useState<LessonPlan[]>([]);
    const [progress, setProgress] = useState<Pupil['progress'] | {} >({});
    const [hasChanges, setHasChanges] = useState(false);
    
    useEffect(() => {
        const foundPupil = initialPupils.find(p => p.id === pupilId);
        if (foundPupil) {
            setPupil(foundPupil);
            setLessons(initialLessons.filter(l => l.pupilId === pupilId));
            setPlans(lessonPlans);
            setProgress(foundPupil.progress || {});
        } else {
            // In a real app this would likely be a 404
            console.error("Pupil not found or not assigned to this instructor");
        }
    }, [pupilId]);
    
    useEffect(() => {
        // Check if progress has changed from initial state
        if (!pupil) return;
        const initialProgress = JSON.stringify(pupil.progress);
        const currentProgress = JSON.stringify(progress);
        setHasChanges(initialProgress !== currentProgress);
    }, [progress, pupil]);

    if (!pupil) {
        return notFound();
    }
    
    const handleProgressChange = (skill: string, value: number[]) => {
        setProgress(prev => ({ ...prev, [skill]: value[0] }));
    };

    const handleSaveProgress = () => {
        if (!pupil) return;
        
        // Find the pupil in the original data array and update them
        const pupilIndex = initialPupils.findIndex(p => p.id === pupil.id);
        if (pupilIndex !== -1) {
            const updatedPupil = { ...initialPupils[pupilIndex], progress: progress as Pupil['progress'] };
            initialPupils[pupilIndex] = updatedPupil;
            setPupil(updatedPupil); // Update local state to reflect saved changes
        }

        setHasChanges(false);
        toast({
            title: "Progress Saved!",
            description: `${pupil.name}'s progress has been updated.`,
        });
    }

    const updateLessonState = (lessonId: string, updates: Partial<Lesson>) => {
         // Update the master lessons array
        const lessonIndex = initialLessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
            initialLessons[lessonIndex] = { ...initialLessons[lessonIndex], ...updates };
        }

        // Update the local component state to re-render
        setLessons(prevLessons => prevLessons.map(l => l.id === lessonId ? {...l, ...updates} : l));
    }

    const handleSaveNote = (lessonId: string, note: string) => {
        updateLessonState(lessonId, { notes: note });
        toast({
            title: "Note Saved",
            description: "The note has been added to the lesson history.",
        });
    };
    
    const handleSavePlan = (lessonId: string, newPlan: string) => {
        saveLessonPlan(lessonId, newPlan);
        setPlans([...lessonPlans]); // Trigger re-render by creating a new array reference
        toast({
            title: "Lesson Plan Saved",
            description: "The lesson plan has been updated.",
        });
    }

    const handleLessonStatusChange = (lessonId: string, status: 'completed' | 'no-show') => {
        updateLessonState(lessonId, { status });
         toast({
            title: `Lesson Marked as ${status === 'completed' ? 'Complete' : 'No-Show'}`,
            description: "The lesson status has been updated.",
        });
    }

    const progressItems = Object.entries(progress).map(([key, value]) => ({
        skill: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()),
        value,
        key: key,
    }));

    const { address, theoryTest, practicalTest } = pupil;

    const allPupilLessons = lessons.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${pupil.avatar}`} data-ai-hint="person portrait"/>
                            <AvatarFallback>{pupil.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{pupil.name}</CardTitle>
                            <CardDescription>Pupil Record</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{pupil.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{pupil.phone}</span>
                        </div>
                         <div className="flex items-start gap-3">
                            <Home className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="text-sm">
                                <p>{address.line1}, {address.city}, {address.postcode}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <BookUser className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">{pupil.licenceNumber}</span>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Test Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4 pt-2">
                           <TestHistoryDisplay title="Theory Test" attempts={theoryTest} />
                           <TestHistoryDisplay title="Practical Test" attempts={practicalTest} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Progress Tracking</CardTitle>
                                <CardDescription>Development record for key driving skills.</CardDescription>
                            </div>
                            {hasChanges && (
                                <Button onClick={handleSaveProgress}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {progressItems.map(item => (
                            <div key={item.key}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">{item.skill}</h4>
                                    <span className="text-sm font-semibold w-12 text-center rounded-md bg-secondary text-secondary-foreground py-1">{item.value}%</span>
                                </div>
                                <Slider
                                    value={[item.value]}
                                    onValueChange={(value) => handleProgressChange(item.key, value)}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lesson History</CardTitle>
                        <CardDescription>Review past lessons and add notes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {allPupilLessons.length > 0 ? allPupilLessons.map(lesson => {
                                const lessonIsInPast = isPast(parseISO(lesson.date));
                                const needsAction = lessonIsInPast && !lesson.status;
                                const plan = plans.find(p => p.lessonId === lesson.id);
                                const pupilFeedback = lessonFeedback.find(f => f.lessonId === lesson.id);

                                return (
                                <Dialog key={lesson.id}>
                                    <DialogTrigger asChild>
                                        <div className="w-full text-left p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{lesson.title}</p>
                                                    <p className="text-sm text-muted-foreground">{format(parseISO(lesson.date), "EEEE, do MMMM yyyy 'at' HH:mm")}</p>
                                                    {lesson.status && <Badge variant={lesson.status === 'no-show' ? 'destructive' : 'secondary'} className="mt-2">{lesson.status}</Badge>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {needsAction && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleLessonStatusChange(lesson.id, 'completed')}}><CheckCircle className="mr-2 h-4 w-4 text-green-600"/>Complete</Button>
                                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleLessonStatusChange(lesson.id, 'no-show')}}><XCircle className="mr-2 h-4 w-4 text-red-600" />No-Show</Button>
                                                        </>
                                                    )}
                                                    {lessonIsInPast && (
                                                        <AddNoteDialog lesson={lesson} onSaveNote={handleSaveNote}>
                                                            <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
                                                                <NotebookPen className="mr-2 h-4 w-4" />
                                                                {lesson.notes ? 'Edit Note' : 'Add Note'}
                                                            </Button>
                                                        </AddNoteDialog>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <InstructorLessonDialog lesson={lesson} plan={plan} feedback={pupilFeedback} onPlanSave={handleSavePlan} />
                                </Dialog>
                                )
                            }) : <p className="text-sm text-muted-foreground">No lessons recorded yet.</p>}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Lesson Notes</CardTitle>
                        <CardDescription>A log of all notes from previous lessons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {lessons.filter(l => l.notes).length > 0 ? (
                                lessons.filter(l => l.notes).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(lesson => (
                                    <div key={`note-${lesson.id}`} className="p-3 bg-secondary/50 rounded-lg">
                                        <p className="font-semibold text-sm">{format(new Date(lesson.date), "do MMMM yyyy")}</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{lesson.notes}</p>
                                    </div>
                                ))
                            ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4">No notes have been added yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
