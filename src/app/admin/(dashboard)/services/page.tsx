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
import { ServiceForm } from '@/components/admin/service-form';
import { ServicesTable } from '@/components/admin/services-table';
import { useServices } from '@/hooks/use-services';
import { type Service } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { services as mockServices } from '@/lib/mock-data';

export default function AdminServicesPage() {
  const { services: servicesFromDb, isLoading, error } = useServices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const services =
    isLoading || !servicesFromDb || servicesFromDb.length === 0
      ? mockServices
      : servicesFromDb;

  const handleAddClick = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Services</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete your company&apos;s services.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ServiceForm service={editingService} onSuccess={handleSuccess} />
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

      {error && <p className="text-destructive">{error.message}</p>}

      {!isLoading && !error && (
        <ServicesTable services={services} onEdit={handleEditClick} />
      )}
    </div>
  );
}
