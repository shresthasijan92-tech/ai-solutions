import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, MessageSquare } from 'lucide-react';
import { HomepageSuggestions } from '@/components/admin/homepage-suggestions';
import { projects, services, testimonials } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Services', value: services.length, icon: Briefcase },
    { title: 'Total Projects', value: projects.length, icon: FileText },
    { title: 'Pending Feedback', value: testimonials.filter(t => t.status === 'pending').length, icon: MessageSquare },
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
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
