'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectForm } from '@/components/admin/project-form';
import { ProjectsTable } from '@/components/admin/projects-table';
import { useProjects } from '@/hooks/use-projects';
import { type Project } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { projects as mockProjects } from '@/lib/mock-data';

export default function AdminProjectsPage() {
  const { projects: projectsFromDb, isLoading, error } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projects = isLoading || projectsFromDb.length > 0 ? projectsFromDb : mockProjects;

  const handleAddClick = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Projects</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete your company&apos;s projects.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ProjectForm project={editingProject} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <ProjectsTable projects={projects} onEdit={handleEditClick} />
      )}
    </div>
  );
}
