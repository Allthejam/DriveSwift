
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Save } from 'lucide-react';
import { pupils as allPupils, lessons as allLessons, saveLessonPlan } from '@/lib/data';
import { generateLessonPlan } from '@/ai/flows/generate-lesson-plan';
import { useToast } from '@/hooks/use-toast';
import { format, isFuture, parseISO } from 'date-fns';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  pupilId: z.string({ required_error: 'Please select a student.' }),
  lessonId: z.string({ required_error: 'Please select a lesson.' }),
  studentSkillLevel: z.string({ required_error: 'Please select a skill level.' }),
  studentLearningPace: z.string({ required_error: 'Please select a learning pace.' }),
  lessonObjective: z.string().min(10, {
    message: 'Objective must be at least 10 characters.',
  }),
  additionalNotes: z.string().optional(),
});

export function LessonPlannerForm() {
  const searchParams = useSearchParams();
  const instructorId = searchParams.get('instructorId') || '1';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);
  const [selectedPupilId, setSelectedPupilId] = useState<string>('');
  const [availableLessons, setAvailableLessons] = useState<typeof allLessons>([]);
  const [pupils, setPupils] = useState(allPupils.filter(p => p.instructorId === instructorId));

  useEffect(() => {
    setPupils(allPupils.filter(p => p.instructorId === instructorId));
  }, [instructorId]);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lessonObjective: '',
      additionalNotes: '',
    },
  });

  useEffect(() => {
    if (selectedPupilId) {
      const futureLessons = allLessons.filter(
        (lesson) => lesson.pupilId === selectedPupilId && isFuture(parseISO(lesson.date))
      );
      setAvailableLessons(futureLessons);
      form.resetField('lessonId');
    } else {
      setAvailableLessons([]);
    }
  }, [selectedPupilId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLessonPlan(null);
    try {
        const pupil = pupils.find(p => p.id === values.pupilId);
        if (!pupil) throw new Error("Pupil not found");

      const result = await generateLessonPlan({
        studentName: pupil.name,
        studentSkillLevel: values.studentSkillLevel,
        studentLearningPace: values.studentLearningPace,
        lessonObjective: values.lessonObjective,
        additionalNotes: values.additionalNotes,
      });
      setLessonPlan(result.lessonPlan);
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate lesson plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSavePlan = () => {
    const lessonId = form.getValues('lessonId');
    if (!lessonPlan || !lessonId) return;
    
    setIsSaving(true);
    try {
      saveLessonPlan(lessonId, lessonPlan);
      toast({
        title: 'Lesson Plan Saved!',
        description: 'The plan has been successfully saved to the selected lesson.',
      });
      // Optionally reset the form or clear the plan
      setLessonPlan(null);
      form.reset();
      setSelectedPupilId('');
    } catch (error) {
      console.error('Failed to save lesson plan:', error);
       toast({
        variant: 'destructive',
        title: 'Error Saving',
        description: 'Could not save the lesson plan.',
      });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Lesson Planner</CardTitle>
          <CardDescription>
            Generate a personalized lesson plan for your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pupilId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedPupilId(value); }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pupils.map((pupil) => (
                          <SelectItem key={pupil.id} value={pupil.id}>
                            {pupil.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPupilId && (
                 <FormField
                  control={form.control}
                  name="lessonId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upcoming Lesson</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={availableLessons.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={availableLessons.length > 0 ? "Select a lesson to plan for" : "No upcoming lessons for this pupil"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableLessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id}>
                              {lesson.title} - {format(parseISO(lesson.date), "EEE, do MMM yyyy 'at' HH:mm")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentSkillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentLearningPace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Pace</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pace" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Slow">Slow</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lessonObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Objective</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Master reverse bay parking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Student is nervous at junctions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !form.watch('lessonId')} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Lesson Plan</CardTitle>
              <CardDescription>
                Review and edit the plan, then save it to the lesson.
              </CardDescription>
            </div>
            {lessonPlan && (
              <Button onClick={handleSavePlan} disabled={isSaving}>
                 {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Plan
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2">Generating plan...</p>
              </div>
            </div>
          )}
          {lessonPlan && (
             <Textarea 
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                className="flex-grow prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md bg-secondary/50 p-4 h-full"
            />
          )}
          {!isLoading && !lessonPlan && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Wand2 className="mx-auto h-8 w-8" />
                <p className="mt-2">Your lesson plan awaits.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
