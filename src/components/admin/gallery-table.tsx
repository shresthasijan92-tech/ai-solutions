'use client';

import type { GalleryImage as GalleryImageDef } from '@/lib/definitions';
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
import { MoreHorizontal, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteGalleryImage } from '@/lib/actions/gallery';
import Image from 'next/image';

type GalleryTableProps = {
  galleryImages: GalleryImageDef[];
  onEdit: (image: GalleryImageDef) => void;
};

export function GalleryTable({ galleryImages, onEdit }: GalleryTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImageDef | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (image: GalleryImageDef) => {
    setImageToDelete(image);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    const result = await deleteGalleryImage(imageToDelete.id);
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
    setImageToDelete(null);
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {galleryImages.map((galleryImage) => {
                return (
                    <TableRow key={galleryImage.id}>
                        <TableCell>
                        {galleryImage.imageUrl && (
                            <Image
                            src={galleryImage.imageUrl}
                            alt={galleryImage.title}
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                            />
                        )}
                        </TableCell>
                        <TableCell className="font-medium">{galleryImage.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{galleryImage.category}</Badge>
                        </TableCell>
                        <TableCell>
                        {galleryImage.featured ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => onEdit(galleryImage)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleDeleteClick(galleryImage)}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image titled &quot;{imageToDelete?.title}&quot;.
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
