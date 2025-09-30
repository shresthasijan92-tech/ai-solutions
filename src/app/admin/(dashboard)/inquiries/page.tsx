'use client';

import { useInquiries } from '@/hooks/use-inquiries';
import { InquiriesTable } from '@/components/admin/inquiries-table';
import { Skeleton } from '@/components/ui/skeleton';
import { MailQuestion } from 'lucide-react';

export default function AdminInquiriesPage() {
  const { inquiries, isLoading, error } = useInquiries();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Contact Form Inquiries</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage messages submitted through the website's contact form.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : inquiries && inquiries.length > 0 ? (
        <InquiriesTable inquiries={inquiries} />
      ) : (
         <div className="text-center py-10 border-2 border-dashed rounded-lg">
           <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No Inquiries Found</h3>
          <p className="text-muted-foreground mt-2">No messages have been submitted through the contact form yet.</p>
        </div>
      )}
    </div>
  );
}
