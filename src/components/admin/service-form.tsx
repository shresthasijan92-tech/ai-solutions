'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Service } from '@/lib/definitions';
import { createService, updateService } from '@/lib/actions/services';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const ServiceFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.string().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
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
      title: service?.title || '',
      description: service?.description || '',
      details: service?.details || '',
      price: service?.price || '',
      benefits: service?.benefits?.join(', ') || '',
      imageUrl: service?.imageUrl || '',
      featured: service?.featured || false,
    },
  });

  const onSubmit = (data: ServiceFormValues) => {
    startTransition(async () => {
      const action = service?.id ? updateService.bind(null, service.id) : createService;
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
              <Label>Short Description</Label>
              <FormControl>
                <Textarea placeholder="A short description for the card view." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <Label>Full Details (for Dialog)</Label>
              <FormControl>
                <Textarea placeholder="A more detailed description..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <Label>Key Benefits</Label>
              <FormControl>
                <Input placeholder="Benefit 1, Benefit 2, Benefit 3" {...field} />
              </FormControl>
               <p className="text-sm text-muted-foreground">Enter a comma-separated list of key benefits.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <Label>Price</Label>
              <FormControl>
                <Input placeholder="Starting at $5,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <Label>Service Image URL</Label>
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
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Feature on homepage</Label>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service?.id ? 'Save Changes' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
}
