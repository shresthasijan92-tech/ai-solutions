'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, DollarSign } from 'lucide-react';
import type { Service } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';

type ServiceDetailsDialogProps = {
  service: Service;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ServiceDetailsDialog({
  service,
  isOpen,
  onOpenChange,
}: ServiceDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {service.imageUrl && (
            <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
                <Image 
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover"
                />
            </div>
          )}
          <DialogTitle className="text-3xl font-headline">{service.title}</DialogTitle>
          <DialogDescription className="text-lg">
            {service.description}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="space-y-6">
          {service.details && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Service Details</h3>
              <p className="text-muted-foreground">{service.details}</p>
            </div>
          )}
          {service.benefits && service.benefits.length > 0 && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-3">Key Benefits</h3>
              <ul className="space-y-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {service.price && (
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Pricing</h3>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                <p className="text-muted-foreground font-semibold">{service.price}</p>
              </div>
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-end">
            <Button asChild>
                <Link href="/contact">Get a Quote</Link>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
