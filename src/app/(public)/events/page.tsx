import { getEvents } from '@/lib/events';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/firebase/config';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}


export default async function EventsPage() {
  const events = isFirebaseConfigured ? await getEvents() : [];

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Events</h1>
       {!isFirebaseConfigured ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Firebase Not Configured</h3>
            <p className="text-muted-foreground mt-2">
                Please set up your .env.local file with your Firebase credentials to see events.
            </p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Events Found</h3>
            <p className="text-muted-foreground mt-2">
                You can add events in the admin panel.
            </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden group flex flex-col">
              <CardHeader className="p-0">
                <Link href={`/events/${event.id}`} className="block relative h-48 w-full overflow-hidden">
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
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-headline text-xl mb-2 font-semibold leading-tight">
                  <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
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
                <p className="text-muted-foreground flex-grow mb-4">{event.description}</p>
                 <Button variant="link" className="p-0 h-auto self-start mt-auto" asChild>
                    <Link href={`/events/${event.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
