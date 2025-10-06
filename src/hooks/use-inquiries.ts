'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Inquiry } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setInquiries([]);
        return;
    };

    const inquiriesQuery = query(collection(firestore, 'inquiries'), orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(inquiriesQuery, 
      (snapshot) => {
        const data: Inquiry[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
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
  }, [firestore]);

  return { inquiries, isLoading, error };
}
