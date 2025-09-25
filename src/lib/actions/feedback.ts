'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
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
    status: 'pending',
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

export async function updateTestimonialStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; message?: string }> {
  const testimonialDoc = doc(firestore, 'testimonials', id);
  const payload = { status };

  try {
    await updateDoc(testimonialDoc, payload);
    revalidatePath('/admin/feedback');
    revalidatePath('/feedback');
    return { success: true, message: `Testimonial has been ${status}.` };
  } catch (error: any) {
    console.error('Error updating testimonial status:', error);
    return {
      success: false,
      message: `Failed to update testimonial status due to a server error.`,
    };
  }
}
