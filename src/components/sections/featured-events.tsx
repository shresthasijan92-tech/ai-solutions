import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { events } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function FeaturedEvents() {
  const featuredEvents = events.filter((event) => event.featured);

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold">Upcoming Events</h2>
          <Button variant="ghost" asChild>
            <Link href="/events">
              All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-6">
          {featuredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 md:flex md:items-center md:justify-between">
                <div className="md:w-1/4 mb-4 md:mb-0 text-center md:text-left">
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.date).getFullYear()}
                  </div>
                </div>
                <div className="md:w-2/4">
                  <CardTitle className="font-headline text-xl mb-2">{event.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" /> {event.location}
                  </div>
                </div>
                <div className="md:w-1/4 mt-4 md:mt-0 md:text-right">
                  <Button asChild>
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
