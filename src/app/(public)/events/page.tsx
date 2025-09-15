import { getEvents } from '@/lib/events';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Events</h1>
       {events.length === 0 ? (
        <p>No events found. The database might be empty. You can add events in the admin panel.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
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
      )}
    </div>
  );
}
