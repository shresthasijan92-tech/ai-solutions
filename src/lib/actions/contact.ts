'use server';

import { z } from 'zod';
// In a real application, you would use a library like nodemailer to send an email.
// For this demo, we'll just log the message to the console.

const ContactFormSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  companyName: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  contactNumber: z.string().optional(),
  projectDetails: z.string(),
});

export type ContactFormState = {
  message: string;
  success: boolean;
};

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
    // Here you would implement your email sending logic.
    console.log('New contact message received:');
    console.log(validatedFields.data);
    
    // Simulate a successful email send.
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
