'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Service } from '@/lib/definitions';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const servicesCol = collection(db, 'services');
    const q = query(servicesCol);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const servicesList: Service[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Service));
        setServices(servicesList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching services:', err);
        setError('Failed to fetch services. Please try again later.');
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { services, isLoading, error };
}
