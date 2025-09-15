import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FeaturedProjects() {
  const featuredProjects = projects.filter((project) => project.featured);

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
          {featuredProjects.map((project) => {
            const image = PlaceHolderImages.find(p => p.id === project.imageId);
            return (
              <Card key={project.id} className="overflow-hidden group">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
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
                    <Link href={project.link}>View Case Study <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
