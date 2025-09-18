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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Service } from '@/lib/definitions';
import {
  createService,
  updateService,
} from '@/lib/actions/services';

const ServiceFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon name from lucide-react is required'),
  imageUrl: z.string().optional(),
  featured: z.boolean(),
});

type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: () => void;
};

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      imageUrl: '',
      featured: false,
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        title: service.title || '',
        description: service.description || '',
        icon: service.icon || '',
        imageUrl: service.imageUrl || '',
        featured: service.featured || false,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        icon: '',
        imageUrl: '',
        featured: false,
      });
    }
  }, [service, form]);
  
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

  const onSubmit = (data: ServiceFormValues) => {
    startTransition(async () => {
      const action = service?.id
        ? updateService.bind(null, service.id)
        : createService;
      
      const result = await action(data);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        onSuccess();
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
        if (result.errors) {
            Object.entries(result.errors).forEach(([key, value]) => {
                if (value) {
                    form.setError(key as keyof ServiceFormValues, {
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
                <Input placeholder="AI Strategy Consulting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description of the service"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input placeholder="BrainCircuit" {...field} />
              </FormControl>
              <FormDescription>
                Enter a valid icon name from{' '}
                <a
                  href="https://lucide.dev/icons/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  lucide-react
                </a>
                .
              </FormDescription>
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
                Provide a full web link to an image for the service.
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
                  Check this to display this service on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service?.id ? 'Update Service' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
}
