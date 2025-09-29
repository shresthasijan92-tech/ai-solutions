'use client';

import { useEffect, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { type Event } from '@/lib/definitions';
import {
  createEvent,
  updateEvent,
} from '@/lib/actions/events';
import { cn } from '@/lib/utils';

type EventFormProps = {
  event?: Event | null;
  onSuccess: () => void;
};

const toDate = (timestamp: string | Timestamp | Date | undefined | null): Date => {
  if (!timestamp) {
    return new Date();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Event'}
    </Button>
  );
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const { toast } = useToast();
  
  const action = event?.id ? updateEvent : createEvent;
  const [state, formAction] = useActionState(action, {
    message: '',
    success: false,
    errors: {}
  });

  const [selectedDate, setSelectedDate] = useState<Date>(
    event?.date ? toDate(event.date) : new Date()
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast, onSuccess]);

  useEffect(() => {
    if (event?.date) {
      setSelectedDate(toDate(event.date));
    }
  }, [event]);

  return (
      <form
        action={formAction}
        className="space-y-6"
      >
        {event?.id && <input type="hidden" name="id" value={event.id} />}
        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="AI Innovation Summit" defaultValue={event?.title} required />
            {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="A short description of the event" defaultValue={event?.description} required />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="San Francisco, CA or Online" defaultValue={event?.location} required />
            {state.errors?.location && <p className="text-sm text-destructive">{state.errors.location.join(', ')}</p>}
        </div>

        <div className="space-y-2">
            <Label>Event Date</Label>
            <input type="hidden" name="date" value={selectedDate.toISOString()} />
            <Popover>
              <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date.join(', ')}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.jpg" defaultValue={event?.imageUrl ?? ''} />
          <p className="text-sm text-muted-foreground">Provide a link to an image, or upload a file below.</p>
           {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl.join(', ')}</p>}
        </div>

         <div className="space-y-2">
          <Label htmlFor="imageFile">Or Upload Image</Label>
          <Input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
          />
          <p className="text-sm text-muted-foreground">This will override the Image URL if both are provided.</p>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox id="featured" name="featured" defaultChecked={event?.featured} />
            <Label htmlFor="featured" className="text-sm font-medium leading-none">Feature on homepage</Label>
        </div>

        <SubmitButton isEditing={!!event?.id} />
      </form>
  );
}
