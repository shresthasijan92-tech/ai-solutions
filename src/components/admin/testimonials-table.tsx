
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteTestimonial } from '@/lib/actions/feedback';
import { type Testimonial } from '@/lib/definitions';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';


type TestimonialsTableProps = {
  testimonials: Testimonial[];
};

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            rating >= star
              ? 'text-primary fill-primary'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}


export function TestimonialsTable({ testimonials }: TestimonialsTableProps) {
  const { toast } = useToast();
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  const handleConfirmDelete = async () => {
    if (!testimonialToDelete) return;
    const result = await deleteTestimonial(testimonialToDelete.id);
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
    setTestimonialToDelete(null);
  };

  if (testimonials.length === 0) {
    return <p>No testimonials have been submitted yet.</p>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">{testimonial.name}</TableCell>
                <TableCell>{testimonial.company}</TableCell>
                <TableCell className="max-w-xs truncate">{testimonial.feedback}</TableCell>
                <TableCell>
                  <StarRating rating={testimonial.rating} />
                </TableCell>
                <TableCell>{toDate(testimonial.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                   <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setTestimonialToDelete(testimonial)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the testimonial from &quot;{testimonialToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
