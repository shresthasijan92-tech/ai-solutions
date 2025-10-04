import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { getEvents } from '@/lib/events';
import { Timestamp } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/firebase/config';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}


export async function FeaturedEvents() {
  if (!isFirebaseConfigured) return null;

  const allEvents = await getEvents();
  const eventsToDisplay = allEvents.filter(event => event.featured);

  if (eventsToDisplay.length === 0) {
    return null;
  }

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
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {eventsToDisplay.map(event => (
            <Card key={event.id} className="overflow-hidden group flex flex-col md:flex-row">
              <CardHeader className="p-0 w-full md:w-1/3">
                <Link
                  href={`/events/${event.id}`}
                  className="block relative h-48 w-full overflow-hidden"
                >
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-secondary h-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </Link>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow w-full md:w-2/3">
                <h3 className="font-headline text-xl mb-2 font-semibold leading-tight">
                  <Link
                    href={`/events/${event.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {event.title}
                  </Link>
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {toDate(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-2" /> {event.location}
                </div>
                <p className="text-muted-foreground flex-grow mb-4 text-sm line-clamp-2">
                  {event.description}
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto self-start mt-auto"
                  asChild
                >
                  <Link href={`/events/${event.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
