import { ContactForm } from '@/components/contact-form';
import { Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Have a project in mind or just want to learn more about our services? Fill out the form, and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-primary" />
              <a href="mailto:contact@aisolutions.com" className="hover:text-primary">
                contact@aisolutions.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-primary" />
              <span>+44 123 456 7890</span>
            </div>
          </div>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-lg">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
