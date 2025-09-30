
'use client';

import { useTestimonials } from '@/hooks/use-testimonials';
import { TestimonialsTable } from '@/components/admin/testimonials-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminFeedbackPage() {
  const { testimonials, isLoading, error } = useTestimonials();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Manage Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage user-submitted testimonials.
        </p>
      </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error.message}</p>
        ) : (
          <TestimonialsTable testimonials={testimonials || []} />
        )}
    </div>
  );
}
