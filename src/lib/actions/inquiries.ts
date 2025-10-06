'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, addDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/firebase/config';

const InquiryFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  contactNumber: z.string().optional(),
  message: z.string().min(10, 'Please provide a message with at least 10 characters.'),
});

export type InquiryFormState = {
  message: string;
  success: boolean;
};

function revalidateInquiryPaths() {
    revalidatePath('/admin/inquiries');
    revalidatePath('/contact');
}

export async function sendInquiryMessage(
  data: z.infer<typeof InquiryFormSchema>
): Promise<InquiryFormState> {
  const validatedFields = InquiryFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      success: false,
    };
  }
  
  if (!isFirebaseConfigured || !firestore) {
    return {
        message: 'There was an error sending your message. Please try again later.',
        success: false,
    };
  }

  try {
    const inquiriesCollection = collection(firestore, 'inquiries');
    await addDoc(inquiriesCollection, {
        ...validatedFields.data,
        submittedAt: Timestamp.now(),
    });

    revalidateInquiryPaths();
    
    return {
      message: "We've received your message and will get back to you shortly.",
      success: true,
    };
  } catch (error: any) {
     if (error.code === 'permission-denied') {
      // This is a placeholder for a more sophisticated error handling system.
      // In a real application, you would log this error and might re-throw a custom,
      // more detailed error to be handled by a global error handler.
      console.error("Firestore Permission Denied:", {
        collection: 'inquiries',
        operation: 'create',
        data: validatedFields.data,
      });
      return {
        message: 'A security rule is preventing your message from being sent. Please contact support.',
        success: false,
      };
    }
    console.error('Error sending contact message:', error);
    return {
      message: 'There was an error sending your message. Please try again later.',
      success: false,
    };
  }
}

export async function deleteInquiry(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: 'Failed to delete inquiry: Missing ID.' };
  }
  
  if (!isFirebaseConfigured || !firestore) {
     return {
      success: false,
      message: 'The server is not configured correctly to connect to the database.',
    };
  }

  try {
    const inquiryDoc = doc(firestore, 'inquiries', id);
    await deleteDoc(inquiryDoc);
    revalidateInquiryPaths();
    return { success: true, message: `Inquiry has been deleted.` };
  } catch (error: any) {
    console.error('Error deleting inquiry:', error);
    return {
      success: false,
      message: `Failed to delete inquiry due to a server error.`,
    };
  }
}
