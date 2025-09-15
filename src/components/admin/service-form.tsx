'use client';

import { useActionState, useEffect, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { createService, updateService, type ServiceFormState } from '@/lib/actions/services';
import { Loader2 } from 'lucide-react';

const ServiceFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon name from lucide-react is required'),
  featured: z.boolean(),
});

type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: () => void;
};

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState: ServiceFormState = { message: '', errors: {} };
  const formAction = service ? updateService.bind(null, service.id) : createService;
  const [state, dispatch] = useActionState(formAction, initialState);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      icon: service?.icon || '',
      featured: service?.featured || false,
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        onSuccess();
        formRef.current?.reset();
        form.reset();
      }
    }
  }, [state, toast, onSuccess, form]);
  
  const handleSubmit = (data: ServiceFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(() => {
      dispatch(formData);
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit)}
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
                <Textarea placeholder="A short description of the service" {...field} />
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
                <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                <FormLabel>
                  Feature on homepage
                </FormLabel>
                <FormDescription>
                  Check this to display this service on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
}
