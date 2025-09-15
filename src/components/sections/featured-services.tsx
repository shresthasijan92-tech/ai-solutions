import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { services as mockServices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { getServices } from '@/lib/services';

export async function FeaturedServices() {
  const allServices = await getServices();
  const featuredServices = allServices.filter((service) => service.featured);

  // If there are no featured services in the database, fall back to mock data.
  // This is useful for initial setup before data is seeded.
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
              <Card key={service.id} className="group flex flex-col transition-all duration-300 hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-lg bg-primary/10 p-4 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      {Icon && <Icon className="h-8 w-8" />}
                    </div>
                  </div>
                  <CardTitle className="text-center font-headline text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-center text-balance pt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
