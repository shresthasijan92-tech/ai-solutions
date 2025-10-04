'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Service } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setServices([]);
        return;
    };
    
    const servicesQuery = query(collection(firestore, 'services'));

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
  }, [firestore]);

  return { services, isLoading, error };
}
