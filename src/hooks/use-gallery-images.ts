'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GalleryImage } from '@/lib/definitions';

export function useGalleryImages() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const galleryCol = collection(db, 'gallery');
    const q = query(galleryCol);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const imagesList: GalleryImage[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as GalleryImage));
        setGalleryImages(imagesList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching gallery images:', err);
        setError('Failed to fetch gallery images. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { galleryImages, isLoading, error };
}
