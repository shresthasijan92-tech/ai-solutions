'use server';
import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Service } from './definitions';
import { services as mockServices } from './mock-data';

// A mapping from string names to Lucide icon components.
// Note: In a real app, you would likely have a more robust way to map icon names to components.
const iconNameToComponent = {
    'BrainCircuit': 'BrainCircuit',
    'Bot': 'Bot',
    'LineChart': 'LineChart',
    'Code': 'Code',
    'TestTube2': 'TestTube2',
    'Layers3': 'Layers3',
};

// This function fetches all services from the Firestore 'services' collection.
export async function getServices(): Promise<Service[]> {
  try {
    const servicesCol = collection(db, 'services');
    const q = query(servicesCol);
    const servicesSnapshot = await getDocs(q);
    
    if (servicesSnapshot.empty) {
      return [];
    }

    const servicesList = servicesSnapshot.docs.map(doc => {
      const data = doc.data();
      const iconName = data.icon as keyof typeof iconNameToComponent;
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        icon: iconNameToComponent[iconName] || 'BrainCircuit', // Fallback icon
        benefits: data.benefits || [],
        price: data.price || '',
        featured: data.featured || false,
      } as Service;
    });
    return servicesList;
  } catch (error) {
    console.error("Error fetching services from Firestore:", error);
    // In a real production app, you might want to log this error to a monitoring service.
    // For now, we'll return an empty array to allow fallback to mock data.
    return [];
  }
}