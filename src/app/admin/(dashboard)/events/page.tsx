'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/admin/event-form';
import { EventsTable } from '@/components/admin/events-table';
import { useEvents } from '@/hooks/use-events';
import { type Event } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { events as mockEvents } from '@/lib/mock-data';

export default function AdminEventsPage() {
  const { events: eventsFromDb, isLoading, error } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const events = isLoading || eventsFromDb.length > 0 ? eventsFromDb : mockEvents;

  const handleAddClick = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Events</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete your company&apos;s events.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <EventForm event={editingEvent} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <EventsTable events={events} onEdit={handleEditClick} />
      )}
    </div>
  );
}
