import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getProjects } from '@/lib/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projects as mockProjects } from '@/lib/mock-data';

export async function FeaturedProjects() {
  const allProjects = await getProjects();
  const featuredProjects = allProjects.filter((project) => project.featured);
  const projectsToDisplay = featuredProjects.length > 0 ? featuredProjects : mockProjects.filter(p => p.featured);

  if (projectsToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary py-12 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold">Featured Projects</h2>
          <Button variant="ghost" asChild>
            <Link href="/projects">
              View All Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {projectsToDisplay.map((project) => {
            return (
              <Card key={project.id} className="overflow-hidden group">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden">
                    {project.imageUrl && (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="mb-4">{project.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={`/projects/${project.id}`}>View Case Study <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
