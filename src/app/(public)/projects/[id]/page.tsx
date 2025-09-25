import { getProject, getProjects } from '@/lib/projects';
import { projects as mockProjects } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ArticleRenderer } from '@/components/article-renderer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
            </Link>
        </Button>
        <article>
            <header className="mb-8">
                <h1 className="text-4xl font-headline font-bold mb-4">{project.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                </div>
            </header>
            
            {project.imageUrl && (
                <div className="relative h-64 md:h-[450px] w-full mb-8 rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <ArticleRenderer content={project.caseStudy || project.description} />
                </div>
                <div className="md:col-span-1">
                    <div className="sticky top-24 space-y-4">
                         <h3 className="font-headline font-semibold text-lg">Project Details</h3>
                         <p className="text-muted-foreground">{project.description}</p>
                    </div>
                </div>
            </div>
        </article>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const projectsFromDb = await getProjects();
  const projects = projectsFromDb.length > 0 ? projectsFromDb : mockProjects;
 
  return projects.map((project) => ({
    id: project.id,
  }));
}
