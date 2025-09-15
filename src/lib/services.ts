import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Service } from './definitions';

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
  const servicesCol = collection(db, 'services');
  const q = query(servicesCol);
  const servicesSnapshot = await getDocs(q);
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
}
