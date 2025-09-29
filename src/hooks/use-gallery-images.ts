
'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { GalleryImage } from '@/lib/definitions';

export function useGalleryImages(enabled = true) {
  const firestore = useFirestore();
  const galleryCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'gallery') : null),
    [firestore]
  );
  const galleryQuery = useMemoFirebase(() => {
    if (!galleryCol || !enabled) return null;
    return query(galleryCol)
  }, [galleryCol, enabled]);

  const {
    data: galleryImages,
    isLoading,
    error,
  } = useCollection<GalleryImage>(galleryQuery);

  return { galleryImages, isLoading, error };
}
