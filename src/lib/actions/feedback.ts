'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const FeedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  feedback: z.string().min(10, 'Please provide at least 10 characters of feedback.'),
  rating: z.number().min(1).max(5),
});

export type FeedbackFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof FeedbackSchema>>['formErrors']['fieldErrors'];
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

  const testimonialsCollection = collection(db, 'testimonials');
  const payload = {
    ...validatedFields.data,
    createdAt: Timestamp.now(),
    status: 'pending',
  };

  addDoc(testimonialsCollection, payload).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: testimonialsCollection.path,
      operation: 'create',
      requestResourceData: payload,
    });
    // This is a server action, so we can't emit to the client-side listener directly.
    // In a real app, you would log this securely.
    // For this demo, we'll just console.error on the server.
    console.error(permissionError.toString());
  });

  // We are optimistic here, revalidating and returning success immediately.
  revalidatePath('/feedback');

  return {
    message: 'Thank you for your feedback!',
    success: true,
  };
}

export async function updateTestimonialStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; message?: string }> {
    const testimonialDoc = doc(db, 'testimonials', id);
    const payload = { status };

    updateDoc(testimonialDoc, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: testimonialDoc.path,
            operation: 'update',
            requestResourceData: payload,
        });
        console.error(permissionError.toString());
    });

    revalidatePath('/admin/feedback');
    revalidatePath('/feedback');

    return { success: true, message: `Testimonial has been ${status}.` };
}
