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
import { galleryImages as mockGalleryImages } from '@/lib/mock-data';

export default function AdminGalleryPage() {
  const { galleryImages: imagesFromDb, isLoading, error } = useGalleryImages();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const galleryImages = isLoading || imagesFromDb.length > 0 ? imagesFromDb : mockGalleryImages;

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <GalleryTable galleryImages={galleryImages} onEdit={handleEditClick} />
      )}
    </div>
  );
}
