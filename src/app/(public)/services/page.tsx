'use client'

import { useState } from 'react';
import { getServices } from '@/lib/services';
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { services as mockServices } from '@/lib/mock-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ServiceDetailsDialog } from '@/components/service-details-dialog';
import type { Service } from '@/lib/definitions';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useState(() => {
    async function loadServices() {
      const servicesFromDb = await getServices();
      if (servicesFromDb.length > 0) {
        setServices(servicesFromDb);
      }
    }
    loadServices();
  });

  const handleOpenDialog = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <div className="container py-12">
        <h1 className="text-4xl font-headline font-bold mb-8">Our Services</h1>
        {services.length === 0 ? (
          <p>No services found. The database might be empty. You can add services in the admin panel.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = (Lucide as any)[service.icon as any] as Lucide.LucideIcon;
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
                    <div className="mb-4 flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        {Icon && <Icon className="h-6 w-6" />}
                      </div>
                      <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                    </div>
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
        )}
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
