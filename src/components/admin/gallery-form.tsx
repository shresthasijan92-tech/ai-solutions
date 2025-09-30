'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type GalleryImage } from '@/lib/definitions';
import { createGalleryImage, updateGalleryImage } from '@/lib/actions/gallery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const GalleryFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('A valid image URL is required'),
  category: z.enum(["Events", "Tech Solutions", "Team Collaboration"]),
  featured: z.boolean().default(false),
});

type GalleryFormValues = z.infer<typeof GalleryFormSchema>;

type GalleryFormProps = {
  image?: GalleryImage | null;
  onSuccess: () => void;
};

export function GalleryForm({ image, onSuccess }: GalleryFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(GalleryFormSchema),
    defaultValues: {
      title: image?.title || '',
      imageUrl: image?.imageUrl || '',
      category: image?.category || 'Tech Solutions',
      featured: image?.featured || false,
    },
  });

  const onSubmit = (data: GalleryFormValues) => {
    startTransition(async () => {
      const action = image?.id ? updateGalleryImage.bind(null, image.id) : createGalleryImage;
      const result = await action(data);

      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
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
              <Label>Title</Label>
              <FormControl>
                <Input placeholder="Team Collaboration" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <Label>Category</Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Tech Solutions">Tech Solutions</SelectItem>
                  <SelectItem value="Team Collaboration">Team Collaboration</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <Label>Image URL</Label>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Feature on homepage</Label>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {image?.id ? 'Save Changes' : 'Add Image'}
        </Button>
      </form>
    </Form>
  );
}
