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
import { type Project } from '@/lib/definitions';
import {
  createProject,
  updateProject,
} from '@/lib/actions/projects';

const ProjectFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().min(1, 'An image is required'),
  technologies: z.string().min(1, 'At least one technology is required'),
  link: z.string().url('Must be a valid URL'),
  featured: z.boolean(),
  caseStudy: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

type ProjectFormProps = {
  project?: Project | null;
  onSuccess: () => void;
};

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      technologies: '',
      link: '',
      featured: false,
      caseStudy: '',
    },
  });
  
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title || '',
        description: project.description || '',
        imageUrl: project.imageUrl || '',
        technologies: project.technologies.join(', ') || '',
        link: project.link || '',
        featured: project.featured || false,
        caseStudy: project.caseStudy || '',
      });
    } else {
       form.reset({
        title: '',
        description: '',
        imageUrl: '',
        technologies: '',
        link: '',
        featured: false,
        caseStudy: '',
      });
    }
  }, [project, form]);
  
  const onSubmit = (data: ProjectFormValues) => {
    startTransition(async () => {
       const payload = {
        ...data,
        technologies: data.technologies.split(',').map(t => t.trim())
      };
      
      const action = project?.id
        ? updateProject.bind(null, project.id)
        : createProject;
        
      const result = await action(payload);

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
                    form.setError(key as keyof ProjectFormValues, {
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
                <Input placeholder="E-commerce Recommendation Engine" {...field} />
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
                  placeholder="A short description of the project"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="caseStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Study Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="The full case study content for the project."
                  {...field}
                  rows={10}
                />
              </FormControl>
              <FormDescription>
                This content will be displayed on the project's case study page.
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
                Provide a full web link to an image for the project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies</FormLabel>
              <FormControl>
                <Input
                  placeholder="Python, TensorFlow, Firebase"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a comma-separated list of technologies.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/case-study" {...field} />
              </FormControl>
              <FormDescription>
                An optional external link for the project. The primary link will be the internal case study page.
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
                <FormLabel>Feature on homepage</FormLabel>
                <FormDescription>
                  Check this to display this project on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {project?.id ? 'Save Changes' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
}
