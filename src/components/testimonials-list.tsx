'use client';

import { useState, useEffect } from 'react';
import { getTestimonials } from '@/lib/testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { testimonials as mockTestimonials } from '@/lib/mock-data';
import type { Testimonial } from '@/lib/definitions';

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        setIsLoading(true);
        const approvedTestimonials = await getTestimonials(true);
        if (approvedTestimonials.length > 0) {
          setTestimonials(approvedTestimonials);
        } else {
          // Fallback to mock data if the database is empty or returns no approved testimonials
          setTestimonials(mockTestimonials.filter((t) => t.status === 'approved'));
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTestimonials();
  }, []);

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
    return <p className="text-destructive">Failed to load testimonials. Please try again later.</p>;
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
