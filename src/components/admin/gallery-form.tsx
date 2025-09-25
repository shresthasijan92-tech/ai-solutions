'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type GalleryImage } from '@/lib/definitions';
import {
  createGalleryImage,
  updateGalleryImage,
} from '@/lib/actions/gallery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GalleryFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().min(1, 'An image is required'),
  category: z.enum(['Events', 'Tech Solutions', 'Team Collaboration']),
  featured: z.boolean(),
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
      title: '',
      imageUrl: '',
      category: 'Tech Solutions',
      featured: false,
    },
  });
  
  useEffect(() => {
    if (image) {
      form.reset({
        title: image.title || '',
        imageUrl: image.imageUrl || '',
        category: image.category || 'Tech Solutions',
        featured: image.featured || false,
      });
    } else {
      form.reset({
        title: '',
        imageUrl: '',
        category: 'Tech Solutions',
        featured: false,
      });
    }
  }, [image, form]);

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

  const onSubmit = (data: GalleryFormValues) => {
    startTransition(async () => {
      const action = image?.id
        ? updateGalleryImage.bind(null, image.id)
        : createGalleryImage;
        
      const result = await action(data);

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
                    form.setError(key as keyof GalleryFormValues, {
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
              <FormLabel>Category</FormLabel>
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Provide a full web link to an image for the gallery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Or Upload Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, (value) => form.setValue('imageUrl', value))}
            />
          </FormControl>
          <FormDescription>
            Upload an image from your device. This will override the Image URL field.
          </FormDescription>
        </FormItem>
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
                  Check this to display this image on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {image?.id ? 'Save Changes' : 'Create Image'}
        </Button>
      </form>
    </Form>
  );
}
