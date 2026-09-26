'use server';
/**
 * @fileOverview A Genkit flow for processing lesson feedback from pupils.
 *
 * - processLessonFeedback - A function that takes feedback and processes it.
 * - ProcessLessonFeedbackInput - The input type for the processLessonFeedback function.
 * - ProcessLessonFeedbackOutput - The return type for the processLessonFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessLessonFeedbackInputSchema = z.object({
  pupilName: z.string().describe('The name of the pupil submitting feedback.'),
  lessonTitle: z.string().describe('The title of the lesson being reviewed.'),
  lessonDate: z.string().describe('The date of the lesson.'),
  workedWell: z.string().describe('What the pupil felt went well in the lesson.'),
  struggledWith: z.string().describe('What the pupil struggled with.'),
  doMoreOf: z.string().describe('What the pupil would like to do more of in future lessons.'),
  generalFeedback: z.string().optional().describe('Any other general feedback.'),
});
export type ProcessLessonFeedbackInput = z.infer<typeof ProcessLessonFeedbackInputSchema>;

const ProcessLessonFeedbackOutputSchema = z.object({
  confirmationMessage: z.string().describe('A confirmation message to the pupil.'),
  summaryForInstructor: z.string().describe('A summary of the feedback for the instructor.'),
});
export type ProcessLessonFeedbackOutput = z.infer<typeof ProcessLessonFeedbackOutputSchema>;


export async function processLessonFeedback(
  input: ProcessLessonFeedbackInput
): Promise<ProcessLessonFeedbackOutput> {
  // In a real application, you would save the feedback to a database here.
  // For now, we'll just generate a summary for the instructor.
  return processLessonFeedbackFlow(input);
}


const prompt = ai.definePrompt({
  name: 'processLessonFeedbackPrompt',
  input: {schema: ProcessLessonFeedbackInputSchema},
  output: {schema: ProcessLessonFeedbackOutputSchema},
  prompt: `A pupil named {{{pupilName}}} has submitted feedback for the lesson "{{lessonTitle}}" on {{{lessonDate}}}.

  Here is their feedback:
  - Worked Well: {{{workedWell}}}
  - Struggled With: {{{struggledWith}}}
  - Wants to do more of: {{{doMoreOf}}}
  - General Feedback: {{{generalFeedback}}}

  Based on this, generate a concise summary for the instructor and a friendly confirmation message for the pupil.
  `,
});

const processLessonFeedbackFlow = ai.defineFlow(
  {
    name: 'processLessonFeedbackFlow',
    inputSchema: ProcessLessonFeedbackInputSchema,
    outputSchema: ProcessLessonFeedbackOutputSchema,
  },
  async (input) => {
    // For this prototype, we just call the prompt.
    // In a real app, you might save the structured feedback to a database
    // before generating the summary.
    console.log('Processing feedback for:', input.pupilName);
    const {output} = await prompt(input);
    
    // You could also send an email to the instructor here with output.summaryForInstructor
    
    return output!;
  }
);
