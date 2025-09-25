'use client';

import { useState, useEffect } from 'react';
import { getTestimonials } from '@/lib/testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTestimonials() {
      setIsLoading(true);
      try {
        const approvedTestimonials = await getTestimonials(true);
        if (approvedTestimonials.length > 0) {
            setTestimonials(approvedTestimonials);
        } else {
            // Fallback to mock data if firestore is empty
            setTestimonials(mockTestimonials.filter(t => t.status === 'approved'));
        }
      } catch (err: any) {
        setError(err);
        console.error("Could not load testimonials.", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTestimonials();
  }, []);


  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
  }

  if (error) {
    return <p className="text-destructive">Could not load testimonials. {error.message}</p>;
  }

  if (!testimonials || testimonials.length === 0) {
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
