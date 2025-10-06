'use client';

import { useInquiries } from '@/hooks/use-inquiries';
import { InquiriesTable } from '@/components/admin/inquiries-table';
import { Skeleton } from '@/components/ui/skeleton';
import { MailQuestion } from 'lucide-react';
import { isFirebaseConfigured } from '@/firebase/config';

export default function AdminInquiriesPage() {
  const { inquiries, isLoading, error } = useInquiries();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive">{error.message}</p>;
    }
    
    if (!isFirebaseConfigured) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Firebase Not Configured</h3>
          <p className="text-muted-foreground mt-2">
              Please set up your .env.local file with your Firebase credentials to see inquiries.
          </p>
        </div>
      );
    }

    if (inquiries && inquiries.length > 0) {
      return <InquiriesTable inquiries={inquiries} />;
    }

    return (
       <div className="text-center py-10 border-2 border-dashed rounded-lg">
         <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold mt-4">No Inquiries Found</h3>
        <p className="text-muted-foreground mt-2">No messages have been submitted through the contact form yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Contacts</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage messages submitted through the website's contact form.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
