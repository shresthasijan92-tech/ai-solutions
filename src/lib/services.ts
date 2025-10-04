'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import type { Service } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

// Helper function to safely convert Firestore Timestamps
const toISOStringIfTimestamp = (value: any): string | any => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
};

export async function getServices(): Promise<Service[]> {
  if (!isFirebaseConfigured) {
    return [];
  }
  try {
    const servicesCol = collection(firestore, 'services');
    const q = query(servicesCol);
    const servicesSnapshot = await getDocs(q);

    if (servicesSnapshot.empty) {
      return [];
    }

    const servicesList = servicesSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Ensure all potential timestamp fields are converted
      const serviceData = {
        ...data,
        createdAt: toISOStringIfTimestamp(data.createdAt),
        updatedAt: toISOStringIfTimestamp(data.updatedAt),
      };
      
      return {
        id: doc.id,
        ...serviceData
      } as Service;
    });
    return servicesList;
  } catch (error) {
    console.error('Error fetching services from Firestore:', error);
    return [];
  }
}
