'use client'

import { useState, useEffect } from 'react';
import { getServices } from '@/lib/services';
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ServiceDetailsDialog } from '@/components/service-details-dialog';
import type { Service } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { isFirebaseConfigured } from '@/firebase/config';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      if (isFirebaseConfigured) {
        try {
          const servicesFromDb = await getServices();
          setServices(servicesFromDb);
        } catch (error) {
          console.error("Failed to fetch services.", error);
          setServices([]);
        }
      }
      setIsLoading(false);
    }
    loadServices();
  }, []);

  const handleOpenDialog = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };
  
  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (!isFirebaseConfigured) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Firebase Not Configured</h3>
            <p className="text-muted-foreground mt-2">
                Please set up your .env.local file with your Firebase credentials to see services.
            </p>
        </div>
      )
    }

    if (services.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Services Found</h3>
            <p className="text-muted-foreground mt-2">
                The database might be empty, or there could be a connection issue.
            </p>
        </div>
      )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
            return (
            <Card key={service.id} className="group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg">
                <CardHeader className="p-0">
                {service.imageUrl && (
                    <div className="relative h-48 w-full">
                    <Image 
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover"
                    />
                    </div>
                )}
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-grow">
                <CardTitle className="font-headline text-xl mb-4">{service.title}</CardTitle>
                <CardDescription className="text-balance flex-grow">
                    {service.description}
                </CardDescription>
                </CardContent>
                <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleOpenDialog(service)}>
                    Learn More
                </Button>
                </CardFooter>
            </Card>
            )
        })}
        </div>
    );
  }

  return (
    <>
      <div className="container py-12">
        <h1 className="text-4xl font-headline font-bold mb-8">Our Services</h1>
        {renderContent()}
      </div>
       {selectedService && (
        <ServiceDetailsDialog
          service={selectedService}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
