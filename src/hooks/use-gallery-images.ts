'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { GalleryImage } from '@/lib/definitions';

export function useGalleryImages() {
  const firestore = useFirestore();
  const galleryCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'gallery') : null),
    [firestore]
  );
  const galleryQuery = useMemoFirebase(() => (galleryCol ? query(galleryCol) : null), [
    galleryCol,
  ]);

  const {
    data: galleryImages,
    isLoading,
    error,
  } = useCollection<GalleryImage>(galleryQuery);

  return { galleryImages, isLoading, error };
}
