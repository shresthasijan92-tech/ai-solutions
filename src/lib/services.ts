'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Service } from './definitions';

export async function getServices(): Promise<Service[]> {
  try {
    const servicesCol = collection(firestore, 'services');
    const q = query(servicesCol);
    const servicesSnapshot = await getDocs(q);

    if (servicesSnapshot.empty) {
      return [];
    }

    const servicesList = servicesSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data()
      } as Service;
    });
    return servicesList;
  } catch (error) {
    console.error('Error fetching services from Firestore:', error);
    return [];
  }
}
