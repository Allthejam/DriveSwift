'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  studentSkillLevel: z.string().describe('The skill level of the student (e.g., Beginner, Intermediate).'),
  studentLearningPace: z.string().describe('The learning pace of the student (e.g., Fast, Moderate, Slow).'),
  lessonObjective: z.string().describe('The main objective for the lesson.'),
  additionalNotes: z.string().optional().describe('Any extra context or notes.'),
});

export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  lessonPlan: z.string().describe('The generated lesson plan text.'),
});

export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

const lessonPlanPrompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: { schema: GenerateLessonPlanInputSchema },
  output: { format: 'text' },
  prompt: `You are an expert driving instructor who creates detailed and creative lesson plans.
Here's info about the student and the lesson:
- Student name: {{{studentName}}}
- Skill level: {{{studentSkillLevel}}}
- Learning pace: {{{studentLearningPace}}}
- Lesson objective: {{{lessonObjective}}}
- Additional notes: {{{additionalNotes}}}

Create a lesson plan that is no more than 200 words, containing a clear objective, detailed steps, and timings (in minutes) for each step. Include a summary for the student.`,
});

export const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    const { text } = await lessonPlanPrompt(input);
    return { lessonPlan: text };
  }
);

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}
