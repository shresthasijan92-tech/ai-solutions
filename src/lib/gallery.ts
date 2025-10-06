'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query } from 'firebase/firestore';
import type { GalleryImage } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isFirebaseConfigured || !firestore) {
    return [];
  }
  try {
    const galleryCol = collection(firestore, 'gallery');
    const q = query(galleryCol);
    const gallerySnapshot = await getDocs(q);
    const galleryList = gallerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as GalleryImage;
    });
    return galleryList;
  } catch (error) {
    console.error('Error fetching gallery images from Firestore:', error);
    return [];
  }
}
