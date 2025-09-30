'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Service } from '@/lib/definitions';

export function useServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const servicesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'));
  }, [firestore]);


  useEffect(() => {
    if (!servicesQuery) {
        setIsLoading(false);
        return;
    };

    const unsubscribe = onSnapshot(servicesQuery, 
      (snapshot) => {
        const data: Service[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching services:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [servicesQuery]);

  return { services, isLoading, error };
}
