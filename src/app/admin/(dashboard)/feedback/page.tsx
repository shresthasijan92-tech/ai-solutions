'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTestimonials } from '@/hooks/use-testimonials';
import { TestimonialsTable } from '@/components/admin/testimonials-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

export default function AdminFeedbackPage() {
  const { isUserLoading } = useUser();
  // Only enable the testimonials hook once we know the auth state is ready.
  const { testimonials, isLoading, error } = useTestimonials(!isUserLoading);

  const pendingTestimonials = testimonials
    ? testimonials.filter((t) => t.status === 'pending')
    : [];
  const reviewedTestimonials = testimonials
    ? testimonials.filter((t) => t.status !== 'pending')
    : [];

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold">Manage Feedback</h1>
      <p className="text-muted-foreground mt-2">
        Review, approve, or reject user-submitted feedback.
      </p>

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedTestimonials.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {isLoading || isUserLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error.message}</p>
          ) : (
            <TestimonialsTable testimonials={pendingTestimonials} />
          )}
        </TabsContent>
        <TabsContent value="reviewed" className="mt-4">
          {isLoading || isUserLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error.message}</p>
          ) : (
            <TestimonialsTable testimonials={reviewedTestimonials} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
