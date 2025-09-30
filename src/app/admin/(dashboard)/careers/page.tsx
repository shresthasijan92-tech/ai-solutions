
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { JobForm } from '@/components/admin/job-form';
import { JobsTable } from '@/components/admin/jobs-table';
import { useJobs } from '@/hooks/use-jobs';
import { type Job } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCareersPage() {
  const { jobs, isLoading, error } = useJobs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleAddClick = () => {
    setEditingJob(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingJob(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Careers</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete your company&apos;s job listings.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <JobForm job={editingJob} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
         <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : jobs && jobs.length > 0 ? (
        <JobsTable jobs={jobs} onEdit={handleEditClick} />
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Jobs Found</h3>
          <p className="text-muted-foreground mt-2">
              Click the &quot;Add Job&quot; button to create your first one.
          </p>
        </div>
      )}
    </div>
  );
}
