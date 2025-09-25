'use server';

import { getTestimonials } from '@/lib/testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/lib/definitions';
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

export async function TestimonialsList() {
  const approvedTestimonials = await getTestimonials(true);
  const testimonials = approvedTestimonials.length > 0 ? approvedTestimonials : mockTestimonials.filter(t => t.status === 'approved');

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
