import { FeedbackForm } from '@/components/feedback-form';
import { TestimonialsList } from '@/components/testimonials-list';

export default function FeedbackPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-16">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-headline font-bold mb-6">What Our Clients Say</h2>
          <TestimonialsList />
        </div>
        <div className="order-1 md:order-2">
           <div className="bg-card p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-headline font-bold mb-2">Leave Your Feedback</h2>
            <p className="text-muted-foreground mb-6">We'd love to hear about your experience with our services.</p>
            <FeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
}
