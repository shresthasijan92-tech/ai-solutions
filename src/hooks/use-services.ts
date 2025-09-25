'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Service } from '@/lib/definitions';

export function useServices() {
  const firestore = useFirestore();
  const servicesCol = useMemo(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const servicesQuery = useMemo(
    () => (servicesCol ? query(servicesCol) : null),
    [servicesCol]
  );

  const {
    data: services,
    isLoading,
    error,
  } = useCollection<Service>(servicesQuery);

  return { services, isLoading, error };
}
