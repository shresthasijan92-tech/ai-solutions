'use client';

import { useEffect, useActionState } from 'react';
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
import { type Article } from '@/lib/definitions';
import { createArticle, updateArticle } from '@/lib/actions/articles';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type ArticleFormProps = {
  article?: Article | null;
  onSuccess: () => void;
};

// Helper to convert Firestore Timestamp or string to Date
const toDate = (timestamp: string | Timestamp | Date | null | undefined): Date => {
  if (!timestamp) return new Date();
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
      {isEditing ? 'Save Changes' : 'Create Article'}
    </Button>
  );
}

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const { toast } = useToast();
  
  const action = article?.id ? updateArticle : createArticle;

  const [state, formAction] = useActionState(action, {
    message: '',
    success: false,
  });

  // State to manage the date picker separately from the form state
  const [selectedDate, setSelectedDate] = useState<Date>(
    article?.publishedAt ? toDate(article.publishedAt) : new Date()
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
    if (article?.publishedAt) {
      setSelectedDate(toDate(article.publishedAt));
    }
  }, [article]);


  return (
    <form action={formAction} className="space-y-6">
      {article?.id && <input type="hidden" name="id" value={article.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="The Generative AI Revolution"
          defaultValue={article?.title}
          required
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          placeholder="A short summary of the article"
          defaultValue={article?.excerpt}
          required
        />
        {state.errors?.excerpt && (
          <p className="text-sm text-destructive">{state.errors.excerpt.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Full Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="The full content of the article."
          defaultValue={article?.content}
          rows={10}
          required
        />
         <p className="text-sm text-muted-foreground">
            This content will be displayed on the article page.
        </p>
        {state.errors?.content && (
          <p className="text-sm text-destructive">{state.errors.content.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
          <Label>Published Date</Label>
           <input type="hidden" name="publishedAt" value={selectedDate.toISOString()} />
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
           {state.errors?.publishedAt && (
             <p className="text-sm text-destructive">{state.errors.publishedAt.join(', ')}</p>
           )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          defaultValue={article?.imageUrl}
          required
        />
         <p className="text-sm text-muted-foreground">
            Provide a full web link to an image for the article.
        </p>
        {state.errors?.imageUrl && (
          <p className="text-sm text-destructive">{state.errors.imageUrl.join(', ')}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4">
        <Checkbox
          id="featured"
          name="featured"
          defaultChecked={article?.featured}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none">
          Feature on homepage
        </Label>
      </div>

      <SubmitButton isEditing={!!article?.id} />
    </form>
  );
}
