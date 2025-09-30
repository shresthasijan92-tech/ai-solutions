
'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type Job } from '@/lib/definitions';
import { createJob, updateJob, type JobFormState } from '@/lib/actions/jobs';

const JobFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Full-time', 'Part-time', 'Contract']),
});

type JobFormValues = z.infer<typeof JobFormSchema>;

type JobFormProps = {
  job?: Job | null;
  onSuccess: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  // isPending will be derived from useTransition, not useFormStatus
  const [isPending, _] = useTransition();

  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Update Job' : 'Create Job'}
    </Button>
  );
}

export function JobForm({ job, onSuccess }: JobFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const action = job?.id ? updateJob.bind(null, job.id) : createJob;
  const [state, formAction] = useActionState<JobFormState, JobFormValues>(
    action,
    { message: '', success: false, errors: {} }
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: job || {
      title: '',
      description: '',
      location: '',
      type: 'Full-time',
    },
  });

  useEffect(() => {
    reset(job || { title: '', description: '', location: '', type: 'Full-time' });
  }, [job, reset]);
  
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

  const onSubmit = (data: JobFormValues) => {
    startTransition(() => {
      formAction(data);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Controller
                name="title"
                control={control}
                render={({ field }) => <Input id="title" placeholder="Senior AI Engineer" {...field} />}
            />
            {(errors.title || state.errors?.title) && <p className="text-sm text-destructive">{errors.title?.message || state.errors?.title?.[0]}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea id="description" placeholder="A short description of the job" {...field} />}
            />
            {(errors.description || state.errors?.description) && <p className="text-sm text-destructive">{errors.description?.message || state.errors?.description?.[0]}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Controller
                name="location"
                control={control}
                render={({ field }) => <Input id="location" placeholder="Remote" {...field} />}
            />
            {(errors.location || state.errors?.location) && <p className="text-sm text-destructive">{errors.location?.message || state.errors?.location?.[0]}</p>}
        </div>

        <div className="space-y-2">
            <Label>Job Type</Label>
             <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a job type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {(errors.type || state.errors?.type) && <p className="text-sm text-destructive">{errors.type?.message || state.errors?.type?.[0]}</p>}
        </div>
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {job ? 'Update Job' : 'Create Job'}
      </Button>
    </form>
  );
}
