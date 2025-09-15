import { getServices } from '@/lib/services';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { services as mockServices } from '@/lib/mock-data';

export default async function ServicesPage() {
  const servicesFromDb = await getServices();

  // Fallback to mock data if the database is empty
  const services = servicesFromDb.length > 0 ? servicesFromDb : mockServices;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Our Services</h1>
      {services.length === 0 ? (
        <p>No services found. The database might be empty. You can add services in the admin panel.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
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
            )
          })}
        </div>
      )}
    </div>
  );
}
