'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type Job } from '@/lib/definitions';
import { createJob, updateJob, type JobFormState } from '@/lib/actions/jobs';

type JobFormProps = {
  job?: Job | null;
  onSuccess: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Update Job' : 'Create Job'}
    </Button>
  );
}

export function JobForm({ job, onSuccess }: JobFormProps) {
  const { toast } = useToast();
  const action = job?.id ? updateJob : createJob;
  const [state, formAction] = useActionState<JobFormState, FormData>(action, {
    message: '',
    success: false,
    errors: {},
  });
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success!', description: state.message });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {job?.id && <input type="hidden" name="id" value={job.id} />}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Senior AI Engineer" defaultValue={job?.title} required />
        {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="A short description of the job" defaultValue={job?.description} required />
        {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Remote" defaultValue={job?.location} required />
        {state.errors?.location && <p className="text-sm text-destructive">{state.errors.location.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label>Job Type</Label>
        <Select name="type" defaultValue={job?.type || 'Full-time'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.type && <p className="text-sm text-destructive">{state.errors.type.join(', ')}</p>}
      </div>

      <SubmitButton isEditing={!!job?.id} />
    </form>
  );
}
