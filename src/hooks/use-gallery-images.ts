'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { GalleryImage } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useGalleryImages() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setGalleryImages([]);
        return;
    };

    const galleryQuery = query(collection(firestore, 'gallery'));

    const unsubscribe = onSnapshot(galleryQuery, 
      (snapshot) => {
        const data: GalleryImage[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
        setGalleryImages(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching gallery images:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  return { galleryImages, isLoading, error };
}
