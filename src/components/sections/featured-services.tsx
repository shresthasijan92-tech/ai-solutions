'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { services as mockServices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { getServices } from '@/lib/services';
import type { Service } from '@/lib/definitions';
import { ServiceDetailsDialog } from '@/components/service-details-dialog';
import { isFirebaseConfigured } from '@/firebase/config';

export function FeaturedServices() {
  const [servicesToDisplay, setServicesToDisplay] = useState<Service[]>(mockServices.filter(s => s.featured));
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function loadServices() {
      if (isFirebaseConfigured) {
        const allServices = await getServices();
        const featuredServices = allServices.filter((service) => service.featured);
        if (featuredServices.length > 0) {
          setServicesToDisplay(featuredServices);
        }
      }
    }
    loadServices();
  }, []);

  const handleOpenDialog = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  if (servicesToDisplay.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold">Our Services</h2>
            <Button variant="ghost" asChild>
              <Link href="/services">
                See All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {servicesToDisplay.map((service) => {
              return (
                <Card key={service.id} className="group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg">
                  {service.imageUrl && (
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full">
                        <Image 
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </CardHeader>
                  )}
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
              );
            })}
          </div>
        </div>
      </section>
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
