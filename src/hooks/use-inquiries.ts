'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Contact } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Contact[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const inquiriesQuery = useMemo(() => {
    if (!firestore || !isFirebaseConfigured) return null;
    return query(collection(firestore, 'contacts'), orderBy('submittedAt', 'desc'));
  }, [firestore]);


  useEffect(() => {
    if (!inquiriesQuery) {
        setIsLoading(false);
        setInquiries([]);
        return;
    };

    const unsubscribe = onSnapshot(inquiriesQuery, 
      (snapshot) => {
        const data: Contact[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
        setInquiries(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching inquiries:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [inquiriesQuery]);

  return { inquiries, isLoading, error };
}
