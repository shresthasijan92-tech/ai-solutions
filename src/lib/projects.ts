'use server';
import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Project } from './definitions';

export async function getProjects(): Promise<Project[]> {
  try {
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol);
    const projectsSnapshot = await getDocs(q);
    const projectsList = projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        technologies: data.technologies || [],
        featured: data.featured || false,
        link: data.link || '',
      } as Project;
    });
    return projectsList;
  } catch (error) {
    console.error("Error fetching projects from Firestore:", error);
    return [];
  }
}
