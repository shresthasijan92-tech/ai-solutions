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
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteInquiry } from '@/lib/actions/contact';
import { type Contact } from '@/lib/definitions';
import { Timestamp } from 'firebase/firestore';
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
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type InquiriesTableProps = {
  inquiries: Contact[];
};

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<Contact | null>(null);

  const handleDeleteClick = (inquiry: Contact) => {
    setInquiryToDelete(inquiry);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    const result = await deleteInquiry(inquiryToDelete.id);
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
    setDialogOpen(false);
    setInquiryToDelete(null);
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Submitted</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <Accordion asChild type="single" collapsible key={inquiry.id}>
                <AccordionItem value={inquiry.id}>
                  <TableRow>
                    <TableCell>
                      {toDate(inquiry.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {inquiry.fullName}
                    </TableCell>
                    <TableCell>{inquiry.companyName}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-primary hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AccordionTrigger className="p-2 hover:bg-accent rounded-md [&[data-state=open]>svg]:rotate-90" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(inquiry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <AccordionContent>
                        <div className="p-6 bg-muted/50">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold">Country</p>
                              <p>{inquiry.country}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Contact Number</p>
                              <p>{inquiry.contactNumber || 'Not provided'}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="font-semibold">Project Details</p>
                              <p className="whitespace-pre-wrap">
                                {inquiry.projectDetails}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </TableCell>
                  </TableRow>
                </AccordionItem>
              </Accordion>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              inquiry from &quot;{inquiryToDelete?.fullName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
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
