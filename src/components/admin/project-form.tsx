'use client';

import { useTransition } from 'react';
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
import { type Project } from '@/lib/definitions';
import { createProject, updateProject } from '@/lib/actions/projects';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const ProjectFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  caseStudy: z.string().optional(),
  imageUrl: z.string().url('A valid image URL is required.'),
  technologies: z.string().min(1, 'At least one technology is required.'),
  featured: z.boolean().default(false),
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
      title: project?.title || '',
      description: project?.description || '',
      caseStudy: project?.caseStudy || '',
      imageUrl: project?.imageUrl || '',
      technologies: project?.technologies?.join(', ') || '',
      featured: project?.featured || false,
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    startTransition(async () => {
      const action = project?.id ? updateProject.bind(null, project.id) : createProject;
      
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
              <Label>Description</Label>
              <FormControl>
                <Textarea placeholder="A short description of the project" {...field} />
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
              <Label>Case Study Content (Optional)</Label>
              <FormControl>
                <Textarea placeholder="The full case study content for the project page." {...field} rows={10} />
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
              <Label>Project Image URL</Label>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <Label>Technologies</Label>
              <FormControl>
                <Input placeholder="Python, TensorFlow, Firebase" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">Enter a comma-separated list of technologies.</p>
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
          {project?.id ? 'Save Changes' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
}
