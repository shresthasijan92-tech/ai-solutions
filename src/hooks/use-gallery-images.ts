'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { GalleryImage } from '@/lib/definitions';

export function useGalleryImages() {
  const firestore = useFirestore();
  const galleryCol = useMemo(
    () => (firestore ? collection(firestore, 'gallery') : null),
    [firestore]
  );
  const galleryQuery = useMemo(() => (galleryCol ? query(galleryCol) : null), [
    galleryCol,
  ]);

  const {
    data: galleryImages,
    isLoading,
    error,
  } = useCollection<GalleryImage>(galleryQuery);

  return { galleryImages, isLoading, error };
}
