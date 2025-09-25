'use server';
import { db } from './firebase';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
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
        caseStudy: data.caseStudy || '',
      } as Project;
    });
    return projectsList;
  } catch (error) {
    console.error("Error fetching projects from Firestore:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
    try {
        const projectDocRef = doc(db, 'projects', id);
        const docSnap = await getDoc(projectDocRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
        } as Project;
    } catch (error) {
        console.error(`Error fetching project ${id} from Firestore:`, error);
        return null;
    }
}
