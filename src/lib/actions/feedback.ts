
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

const FeedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  feedback: z
    .string()
    .min(10, 'Please provide at least 10 characters of feedback.'),
  rating: z.number().min(1).max(5),
});

export type FeedbackFormState = {
  message: string;
  errors?: z.ZodError<
    z.infer<typeof FeedbackSchema>
  >['formErrors']['fieldErrors'];
  success: boolean;
};

export async function submitFeedback(
  data: z.infer<typeof FeedbackSchema>
): Promise<FeedbackFormState> {
  const validatedFields = FeedbackSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const testimonialsCollection = collection(firestore, 'testimonials');
  const payload = {
    ...validatedFields.data,
    createdAt: Timestamp.now(),
  };

  try {
    await addDoc(testimonialsCollection, payload);
    revalidatePath('/feedback');
    revalidatePath('/admin/feedback');
    return {
      message: 'Thank you for your feedback!',
      success: true,
    };
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return {
      message: 'Failed to submit feedback due to a server error.',
      success: false,
    };
  }
}

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; message?: string }> {
  if (!id) {
    return { success: false, message: 'Failed to delete testimonial: Missing ID.' };
  }
  const testimonialDoc = doc(firestore, 'testimonials', id);

  try {
    await deleteDoc(testimonialDoc);
    revalidatePath('/admin/feedback');
    revalidatePath('/feedback');
    return { success: true, message: `Testimonial has been deleted.` };
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return {
      success: false,
      message: `Failed to delete testimonial due to a server error.`,
    };
  }
}
