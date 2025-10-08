'use client';

import { useEffect, useState } from 'react';
import { getTestimonials } from '@/lib/testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/lib/definitions';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '../ui/skeleton';
import { isFirebaseConfigured } from '@/firebase/config';
import { Button } from '../ui/button';
import Link from 'next/link';

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

export function FeaturedTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      setIsLoading(true);
      if (isFirebaseConfigured) {
        try {
          const allTestimonials = await getTestimonials();
          setTestimonials(allTestimonials.slice(0, 5)); // show latest 5
        } catch (error) {
          console.error("Failed to fetch testimonials.", error);
          setTestimonials([]);
        }
      }
      setIsLoading(false);
    }
    loadTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-secondary py-12 md:py-20">
        <div className="container">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </section>
    );
  }
  
  if (!isFirebaseConfigured || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container">
        <h2 className="text-3xl font-headline font-bold text-center mb-8">What Our Clients Say</h2>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full">
                    <CardContent className="p-6 flex flex-col flex-grow items-center text-center">
                      <MessageSquareQuote className="w-10 h-10 text-primary mb-4" />
                      <p className="text-muted-foreground italic mb-6 flex-grow">
                        &quot;{testimonial.feedback}&quot;
                      </p>
                      <StarRating rating={testimonial.rating} />
                      <p className="font-semibold mt-4">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.company}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
         <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/feedback">Leave Your Feedback</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
