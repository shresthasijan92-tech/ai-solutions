'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '@/lib/definitions';
import { createProject, updateProject } from '@/lib/actions/projects';
import { type ProjectFormState } from '@/lib/actions/projects';

type ProjectFormProps = {
  project?: Project | null;
  onSuccess: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Project'}
    </Button>
  );
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();

  const action = project?.id ? updateProject : createProject;

  const [state, formAction] = useActionState<ProjectFormState, FormData>(
    action,
    {
      message: '',
      success: false,
      errors: {},
    }
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {project?.id && <input type="hidden" name="id" value={project.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="E-commerce Recommendation Engine"
          defaultValue={project?.title}
          required
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">
            {state.errors.title.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="A short description of the project"
          defaultValue={project?.description}
          required
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caseStudy">Case Study Content (Optional)</Label>
        <Textarea
          id="caseStudy"
          name="caseStudy"
          placeholder="The full case study content for the project."
          defaultValue={project?.caseStudy ?? ''}
          rows={10}
        />
        {state.errors?.caseStudy && (
          <p className="text-sm text-destructive">
            {state.errors.caseStudy.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Project Image</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
        <p className="text-sm text-muted-foreground">
          {project?.id
            ? 'Upload a new image to replace the existing one.'
            : 'An image is required for a new project.'}
        </p>
        {state.errors?.image && (
          <p className="text-sm text-destructive">
            {state.errors.image.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies</Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="Python, TensorFlow, Firebase"
          defaultValue={project?.technologies?.join(', ')}
          required
        />
        <p className="text-sm text-muted-foreground">
          Enter a comma-separated list of technologies.
        </p>
        {state.errors?.technologies && (
          <p className="text-sm text-destructive">
            {state.errors.technologies.join(', ')}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4">
        <Checkbox
          id="featured"
          name="featured"
          defaultChecked={project?.featured}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none">
          Feature on homepage
        </Label>
      </div>

      <SubmitButton isEditing={!!project?.id} />
    </form>
  );
}
