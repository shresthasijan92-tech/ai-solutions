'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

const ArticleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  imageUrl: z.string().min(1, 'An image is required'),
  publishedAt: z.date({
    required_error: 'A date of publication is required.',
  }),
  featured: z.boolean(),
});

type ArticleFormValues = z.infer<typeof ArticleFormSchema>;

type ArticleFormProps = {
  article?: Article | null;
  onSuccess: () => void;
};

// Helper to convert Firestore Timestamp or string to Date
const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      imageUrl: '',
      publishedAt: new Date(),
      featured: false,
    },
  });
  
  useEffect(() => {
    form.reset({
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      imageUrl: article?.imageUrl || '',
      publishedAt: article?.publishedAt ? toDate(article.publishedAt) : new Date(),
      featured: article?.featured || false,
    });
  }, [article, form]);


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        fieldChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ArticleFormValues) => {
    startTransition(async () => {
      // If a new image data URI is present in the form data, use it.
      // Otherwise, if we are editing, fall back to the original article's imageUrl.
      const imageData = data.imageUrl.startsWith('data:')
        ? data.imageUrl
        : article?.imageUrl || '';

      const payload = {
        ...data,
        imageUrl: imageData,
      };

      const action = article
        ? updateArticle.bind(null, article.id)
        : createArticle;

      const result = await action(payload);

      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            if (value) {
              form.setError(key as keyof ArticleFormValues, {
                type: 'manual',
                message: value.join(', '),
              });
            }
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="The Generative AI Revolution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short summary of the article"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publishedAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Published Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(toDate(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, onChange)}
                />
              </FormControl>
              <FormDescription>
                Upload an image from your device. If editing, leave this blank
                to keep the existing image.
              </FormDescription>
              {value && !value.startsWith('data:') && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Current image is set. Upload a new one to replace it.
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Feature on homepage</FormLabel>
                <FormDescription>
                  Check this to display this article on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {article ? 'Update Article' : 'Create Article'}
        </Button>
      </form>
    </Form>
  );
}
