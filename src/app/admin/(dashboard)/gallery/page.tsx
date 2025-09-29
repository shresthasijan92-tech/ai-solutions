
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
import { GalleryForm } from '@/components/admin/gallery-form';
import { GalleryTable } from '@/components/admin/gallery-table';
import { useGalleryImages } from '@/hooks/use-gallery-images';
import { type GalleryImage } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

export default function AdminGalleryPage() {
  const { isUserLoading } = useUser();
  const { galleryImages, isLoading: areImagesLoading, error } = useGalleryImages(!isUserLoading);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);


  const handleAddClick = () => {
    setEditingImage(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (image: GalleryImage) => {
    setEditingImage(image);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingImage(null);
  };

  const showLoading = isUserLoading || areImagesLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Add, update, and delete your company&apos;s gallery images.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <GalleryForm image={editingImage} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showLoading ? (
         <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : galleryImages && galleryImages.length > 0 ? (
        <GalleryTable galleryImages={galleryImages} onEdit={handleEditClick} />
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Images Found</h3>
          <p className="text-muted-foreground mt-2">
              Click the &quot;Add Image&quot; button to create your first one.
          </p>
        </div>
      )}
    </div>
  );
}
