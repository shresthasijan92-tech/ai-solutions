import { getEvent, getEvents } from '@/lib/events';
import { events as mockEvents } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, ArrowLeft, MapPin } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
            </Link>
        </Button>
        <article>
            <header className="mb-8">
            <h1 className="text-4xl font-headline font-bold mb-4">{event.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{toDate(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
             <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
            </div>
            </header>
            
            {event.imageUrl && (
                <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
                <p>{event.description}</p>
            </div>
        </article>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const eventsFromDb = await getEvents();
  const events = eventsFromDb.length > 0 ? eventsFromDb : mockEvents;
 
  return events.map((event) => ({
    id: event.id,
  }));
}
