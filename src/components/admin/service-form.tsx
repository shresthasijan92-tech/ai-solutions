'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Service } from '@/lib/definitions';
import { createService, updateService, uploadServiceImage } from '@/lib/actions/services';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: () => void;
};

// Client-side validation schema
const FormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.string().optional(), // Handled as a string, then split
  featured: z.boolean().default(false),
  imageFile: z.any().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      details: service?.details || '',
      price: service?.price || '',
      benefits: service?.benefits?.join(', ') || '',
      featured: service?.featured || false,
      imageFile: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      let imageUrl = service?.imageUrl;
      const { imageFile, benefits, ...otherData } = values;

      // 1. Handle image upload if a new file is provided
      if (imageFile && imageFile.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('imageFile', imageFile[0]);

        const uploadResult = await uploadServiceImage(imageFormData);

        if (!uploadResult.success || !uploadResult.imageUrl) {
          toast({ variant: 'destructive', title: 'Error', description: uploadResult.message });
          return;
        }
        imageUrl = uploadResult.imageUrl;
      }

      // 2. Prepare the data for Firestore
      const serviceData = {
        ...otherData,
        benefits: benefits ? benefits.split(',').map(b => b.trim()).filter(Boolean) : [],
        imageUrl: imageUrl || '',
      };

      // 3. Call the create or update server action
      const result = service?.id
        ? await updateService(service.id, serviceData)
        : await createService(serviceData);
      
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        onSuccess();
      } else {
        // Handle potential validation errors from the server
        const errorMsg = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        toast({ variant: 'destructive', title: 'Error', description: errorMsg });
      }
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="AI Strategy Consulting" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="A short description of the service" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="details" render={({ field }) => (
          <FormItem>
            <FormLabel>Details (for Dialog)</FormLabel>
            <FormControl><Textarea placeholder="A more detailed description..." rows={5} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField control={form.control} name="benefits" render={({ field }) => (
            <FormItem>
                <FormLabel>Key Benefits</FormLabel>
                <FormControl><Input placeholder="Benefit 1, Benefit 2, Benefit 3" {...field} /></FormControl>
                <p className="text-sm text-muted-foreground">Enter a comma-separated list of key benefits.</p>
                <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl><Input placeholder="Starting at $5,000" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="imageFile" render={({ field }) => (
            <FormItem>
              <FormLabel>Service Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                {service?.id ? "Upload a new image to replace the current one." : "Image is optional."}
              </p>
              <FormMessage />
            </FormItem>
          )} />
        
        <FormField control={form.control} name="featured" render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Feature on homepage</FormLabel>
            </div>
          </FormItem>
        )} />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service?.id ? 'Save Changes' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
}
