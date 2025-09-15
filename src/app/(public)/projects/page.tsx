import { getProjects } from '@/lib/projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Our Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found. The database might be empty. You can add projects in the admin panel.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const image = PlaceHolderImages.find(p => p.id === project.imageId);
            return (
              <Card key={project.id} className="overflow-hidden group flex flex-col">
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
                <CardContent className="p-6 flex flex-col flex-grow">
                  <CardTitle className="font-headline text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="mb-4 flex-grow">{project.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                  <Button variant="link" className="p-0 h-auto self-start" asChild>
                    <Link href={project.link}>View Case Study <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
