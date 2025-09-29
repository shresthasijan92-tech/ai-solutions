
'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Service } from '@/lib/definitions';

export function useServices(enabled = true) {
  const firestore = useFirestore();
  const servicesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const servicesQuery = useMemoFirebase(
    () => {
      if (!servicesCol || !enabled) return null;
      return query(servicesCol)
    },
    [servicesCol, enabled]
  );

  const {
    data: services,
    isLoading,
    error,
  } = useCollection<Service>(servicesQuery);

  return { services, isLoading, error };
}
