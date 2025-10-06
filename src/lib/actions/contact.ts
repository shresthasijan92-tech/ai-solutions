'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, addDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';

const ContactFormSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  companyName: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  contactNumber: z.string().optional(),
  message: z.string(),
});

export type ContactFormState = {
  message: string;
  success: boolean;
};

function revalidateInquiryPaths() {
    revalidatePath('/admin/inquiries');
    revalidatePath('/contact');
}

export async function sendContactMessage(
  data: z.infer<typeof ContactFormSchema>
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      success: false,
    };
  }

  try {
    await addDoc(collection(firestore, 'contacts'), {
        ...validatedFields.data,
        submittedAt: Timestamp.now(),
    });

    revalidateInquiryPaths();
    
    return {
      message: "We've received your message and will get back to you shortly.",
      success: true,
    };
  } catch (error) {
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

  try {
    await deleteDoc(doc(firestore, 'contacts', id));
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

    