

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { lessons, pupils, type TestAttempt, lessonPlans, lessonFeedback, Lesson, LessonPlan, LessonFeedback } from "@/lib/data"
import { CalendarIcon, AlertTriangle, BookCheck, Clock, Lightbulb, MessageSquareQuote, Loader2, NotebookText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import React from "react"
import { differenceInDays, format, parseISO, isPast } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { processLessonFeedback } from "@/ai/flows/process-lesson-feedback"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TestCountdownCard = ({ test, type }: { test: TestAttempt, type: 'Theory' | 'Practical' }) => {
    const [daysRemaining, setDaysRemaining] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (test.date) {
            const testDate = parseISO(test.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setDaysRemaining(differenceInDays(testDate, today));
        }
    }, [test.date]);

    if (!test.date || daysRemaining === null || daysRemaining < 0) {
        return null;
    }

    return (
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <BookCheck className="h-6 w-6" />
            </div>
            <div>
                <p className="font-bold text-lg">{daysRemaining}</p>
                <p className="text-sm text-muted-foreground">{daysRemaining === 1 ? 'day until' : 'days until'} your {type} test</p>
                <p className="text-xs mt-1">{format(parseISO(test.date), "EEEE, d MMMM yyyy")}</p>
                {type === 'Practical' && test.location && <p className="text-xs text-muted-foreground">{test.location}</p>}
            </div>
        </div>
    )
}

const feedbackFormSchema = z.object({
  lessonId: z.string({ required_error: 'Please select a lesson.' }),
  workedWell: z.string().min(10, 'Please provide more detail.'),
  struggledWith: z.string().min(10, 'Please provide more detail.'),
  doMoreOf: z.string().min(10, 'Please provide more detail.'),
  generalFeedback: z.string().optional(),
});

function LessonFeedbackCard({ pupil, pastLessons }: { pupil: typeof pupils[0], pastLessons: typeof lessons }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      workedWell: "",
      struggledWith: "",
      doMoreOf: "",
      generalFeedback: ""
    }
  });

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    setIsSubmitting(true);
    const lesson = pastLessons.find(l => l.id === values.lessonId);
    if (!lesson) return;

    try {
      const result = await processLessonFeedback({
        pupilName: pupil.name,
        lessonTitle: lesson.title,
        lessonDate: format(parseISO(lesson.date), "PPP"),
        ...values
      });

      toast({
        title: "Feedback Submitted!",
        description: result.confirmationMessage,
      });
      form.reset();
    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit your feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const reviewableLessons = pastLessons.filter(l => isPast(parseISO(l.date)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-secondary text-secondary-foreground rounded-full h-10 w-10 flex items-center justify-center">
                <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
                <CardTitle>Lesson Feedback</CardTitle>
                <CardDescription>Tell your instructor how your lessons are going.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {reviewableLessons.length > 0 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lessonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select a past lesson to review</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Which lesson are you reviewing?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reviewableLessons.map(lesson => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.title} - {format(parseISO(lesson.date), "do MMM yyyy")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="workedWell" render={({ field }) => (
                <FormItem>
                  <FormLabel>What worked well for you?</FormLabel>
                  <FormControl><Textarea {...field} placeholder="e.g., I finally understood how to use the clutch..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="struggledWith" render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you struggling with?</FormLabel>
                  <FormControl><Textarea {...field} placeholder="e.g., I still get nervous at big roundabouts." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="doMoreOf" render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to do more of?</FormLabel>
                  <FormControl><Textarea {...field} placeholder="e.g., Can we practice bay parking again?" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          </Form>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">You have no completed lessons to review yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

type LessonDetailProps = {
    lesson: Lesson;
    plan: LessonPlan | undefined;
    feedback: LessonFeedback | undefined;
}

function LessonDetailDialog({ lesson, plan, feedback }: LessonDetailProps) {
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
                    <TabsTrigger value="feedback"><MessageSquareQuote className="mr-2 h-4 w-4" />Your Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                     {plan ? (
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4 h-80 overflow-y-auto">
                            {plan.plan}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground h-80 flex items-center justify-center">
                            <p>No lesson plan was created for this lesson.</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                     {lesson.notes ? (
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4 h-80 overflow-y-auto">
                            {lesson.notes}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground h-80 flex items-center justify-center">
                            <p>Your instructor has not added any notes for this lesson yet.</p>
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
                                    <Label className="text-xs text-muted-foreground">What did you struggle with?</Label>
                                    <p className="text-sm">{feedback.struggledWith}</p>
                                </div>
                                    <div>
                                    <Label className="text-xs text-muted-foreground">What would you like to do more of?</Label>
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
                            <p>You have not submitted feedback for this lesson.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}


export default function PupilDashboardPage() {
  const pupil = pupils[0];
  const allPupilLessons = lessons
    .filter(l => l.pupilId === pupil.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastLessons = allPupilLessons.filter(l => isPast(parseISO(l.date)));
  const nextLesson = allPupilLessons.find(l => !isPast(parseISO(l.date)));
  const nextLessonPlan = nextLesson ? lessonPlans.find(p => p.lessonId === nextLesson.id) : null;

  const progressItems = Object.entries(pupil.progress).map(([key, value]) => ({
        skill: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value,
    }));
  
  const [needsTheoryUpdate, setNeedsTheoryUpdate] = React.useState(false);
  const [needsPracticalUpdate, setNeedsPracticalUpdate] = React.useState(false);
  
  const currentTheoryTest = pupil.theoryTest[pupil.theoryTest.length - 1];
  const currentPracticalTest = pupil.practicalTest[pupil.practicalTest.length - 1];
  
  React.useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setNeedsTheoryUpdate(Boolean(currentTheoryTest.status === 'Booked' && currentTheoryTest.date && new Date(currentTheoryTest.date) < today));
    setNeedsPracticalUpdate(Boolean(currentPracticalTest.status === 'Booked' && currentPracticalTest.date && new Date(currentPracticalTest.date) < today));
  }, [currentTheoryTest, currentPracticalTest]);

  const hasUpcomingTest = (test: TestAttempt) => {
    if (test.status === 'Booked' && test.date) {
        const testDate = new Date(test.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        return testDate >= today;
    }
    return false;
  }

  return (
    <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome back, {pupil.name.split(' ')[0]}!</h1>
        
        {(needsTheoryUpdate || needsPracticalUpdate) && (
          <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Update Your Test Status</AlertTitle>
            <AlertDescription className="text-amber-700">
              {needsTheoryUpdate && <p>Your theory test date has passed. Please update the result.</p>}
              {needsPracticalUpdate && <p>Your practical test date has passed. Please update the result.</p>}
              <Button asChild variant="link" className="p-0 h-auto mt-2 text-amber-800 hover:text-amber-900">
                <Link href="/pupil-dashboard/profile">Update Now &rarr;</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
            <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasUpcomingTest(currentTheoryTest) && (
                    <TestCountdownCard test={currentTheoryTest} type="Theory" />
                  )}
                  {hasUpcomingTest(currentPracticalTest) && (
                    <TestCountdownCard test={currentPracticalTest} type="Practical" />
                  )}
                  {!hasUpcomingTest(currentTheoryTest) && !hasUpcomingTest(currentPracticalTest) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tests booked. You can do it!</p>
                  )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Here's how you're doing on key skills.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {progressItems.map(item => (
                  <div key={item.skill}>
                      <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium">{item.skill}</h4>
                          <span className="text-sm text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress value={item.value} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {allPupilLessons.length > 0 ? (
                    allPupilLessons.map(lesson => {
                      const plan = lessonPlans.find(p => p.lessonId === lesson.id);
                      const feedback = lessonFeedback.find(f => f.lessonId === lesson.id);
                      return (
                      <Dialog key={lesson.id}>
                        <DialogTrigger asChild>
                          <li className="flex items-start gap-3 p-2 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                            <CalendarIcon className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">{format(parseISO(lesson.date), "EEEE, d MMMM")}</p>
                              <p className="text-sm text-muted-foreground">{lesson.title}</p>
                            </div>
                          </li>
                        </DialogTrigger>
                        <LessonDetailDialog lesson={lesson} plan={plan} feedback={feedback} />
                      </Dialog>
                    )})
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No lessons on your schedule. Contact your instructor to book!</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            {nextLessonPlan && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>Your Next Lesson: {nextLesson?.title}</CardTitle>
                                <CardDescription>
                                    Prepared for {format(parseISO(nextLesson!.date), "EEEE, d MMMM")}. Here's the plan:
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4">
                            {nextLessonPlan.plan}
                        </div>
                    </CardContent>
                </Card>
            )}

            <LessonFeedbackCard pupil={pupil} pastLessons={pastLessons} />
        </div>
      </div>
  )
}
