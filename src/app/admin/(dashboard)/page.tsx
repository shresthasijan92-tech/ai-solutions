
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, MessageSquare } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { useProjects } from '@/hooks/use-projects';
import { useTestimonials } from '@/hooks/use-testimonials';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { services, isLoading: isLoadingServices } = useServices();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { testimonials, isLoading: isLoadingTestimonials } = useTestimonials();

  const stats = [
    { title: 'Total Services', value: services?.length ?? 0, icon: Briefcase, isLoading: isLoadingServices },
    { title: 'Total Projects', value: projects?.length ?? 0, icon: FileText, isLoading: isLoadingProjects },
    { title: 'Total Feedback', value: testimonials?.length ?? 0, icon: MessageSquare, isLoading: isLoadingTestimonials },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
