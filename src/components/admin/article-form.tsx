'use client';

import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { type Article } from '@/lib/definitions';
import {
  createArticle,
  updateArticle,
} from '@/lib/actions/articles';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const ArticleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  imageId: z.string().min(1, 'Image is required'),
  publishedAt: z.date({
    required_error: "A date of publication is required.",
  }),
  featured: z.boolean(),
});

type ArticleFormValues = z.infer<typeof ArticleFormSchema>;

type ArticleFormProps = {
  article?: Article | null;
  onSuccess: () => void;
};

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      imageId: article?.imageId || '',
      publishedAt: article?.publishedAt ? new Date(article.publishedAt) : new Date(),
      featured: article?.featured || false,
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'publishedAt' && value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (typeof value === 'boolean') {
            formData.append(key, value.toString());
        } else {
            formData.append(key, value);
        }
      });

      const action = article
        ? updateArticle.bind(null, article.id)
        : createArticle;
        
      const result = await action(formData);

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
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
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="imageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an article image" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PlaceHolderImages.filter((img) =>
                    img.id.startsWith('blog-')
                  ).map((image) => (
                    <SelectItem key={image.id} value={image.id}>
                      {image.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
