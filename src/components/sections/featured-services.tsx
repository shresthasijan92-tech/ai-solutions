import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { services as mockServices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { getServices } from '@/lib/services';

export async function FeaturedServices() {
  const allServices = await getServices();
  const featuredServices = allServices.filter((service) => service.featured);
  const servicesToDisplay = featuredServices.length > 0 ? featuredServices : mockServices.filter(s => s.featured);

  return (
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
            const Icon = (Lucide as any)[service.icon as any] as Lucide.LucideIcon;
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
                   <div className="mb-4 flex items-center gap-4">
                    {!service.imageUrl && (
                      <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        {Icon && <Icon className="h-6 w-6" />}
                      </div>
                    )}
                    <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-balance flex-grow">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
