'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import type { Project } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export async function getProjects(): Promise<Project[]> {
  if (!isFirebaseConfigured) {
    return [];
  }
  try {
    const projectsCol = collection(firestore, 'projects');
    const q = query(projectsCol);
    const projectsSnapshot = await getDocs(q);
    const projectsList = projectsSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Project;
    });
    return projectsList;
  } catch (error) {
    console.error('Error fetching projects from Firestore:', error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isFirebaseConfigured) {
    return null;
  }
  try {
    const projectDocRef = doc(firestore, 'projects', id);
    const docSnap = await getDoc(projectDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Project;
  } catch (error) {
    console.error(`Error fetching project ${id} from Firestore:`, error);
    return null;
  }
}
