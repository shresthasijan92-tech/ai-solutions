
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
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { updateTestimonialStatus } from '@/lib/actions/feedback';
import { type Testimonial } from '@/lib/definitions';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const result = await updateTestimonialStatus(id, status);
    if (result.success) {
      toast({
        title: 'Success',
        description: `Testimonial has been ${status}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  if (testimonials.length === 0) {
    return <p>No testimonials in this category.</p>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    testimonial.status === 'approved' && 'bg-green-100 text-green-800',
                    testimonial.status === 'rejected' && 'bg-red-100 text-red-800',
                    testimonial.status === 'pending' && 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {testimonial.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {testimonial.status === 'pending' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(testimonial.id, 'approved')}>
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(testimonial.id, 'rejected')} className="text-destructive">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
