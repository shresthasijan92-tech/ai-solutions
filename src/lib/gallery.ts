'use server';
import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { GalleryImage } from './definitions';

export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const galleryCol = collection(db, 'gallery');
    const q = query(galleryCol);
    const gallerySnapshot = await getDocs(q);
    const galleryList = gallerySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        imageUrl: data.imageUrl,
        featured: data.featured || false,
      } as GalleryImage;
    });
    return galleryList;
  } catch (error) {
    console.error("Error fetching gallery images from Firestore:", error);
    return [];
  }
}
