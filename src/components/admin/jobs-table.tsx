'use client';

import type { Job } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteJob } from '@/lib/actions/jobs';

type JobsTableProps = {
  jobs: Job[];
  onEdit: (job: Job) => void;
};

export function JobsTable({ jobs, onEdit }: JobsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    const result = await deleteJob(jobToDelete.id);
    if (result.message) {
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    }
    setDialogOpen(false);
    setJobToDelete(null);
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{job.type}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => onEdit(job)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteClick(job)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job titled &quot;{jobToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
