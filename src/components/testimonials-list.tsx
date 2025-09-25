'use client';

import { useTestimonials } from '@/hooks/use-testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { testimonials as mockTestimonials } from '@/lib/mock-data';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-5 w-5',
            rating >= star
              ? 'text-primary fill-primary'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsList() {
  const { testimonials: testimonialsFromDb, isLoading, error } = useTestimonials(true);

  const testimonials =
    isLoading || !testimonialsFromDb || testimonialsFromDb.length === 0
      ? mockTestimonials.filter((t) => t.status === 'approved')
      : testimonialsFromDb;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error.message}</p>;
  }

  if (testimonials.length === 0) {
    return <p>No testimonials have been approved yet. Check back soon!</p>;
  }

  return (
    <div className="space-y-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.company}
                </p>
              </div>
              <StarRating rating={testimonial.rating} />
            </div>
            <p className="text-muted-foreground italic">
              &quot;{testimonial.feedback}&quot;
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
