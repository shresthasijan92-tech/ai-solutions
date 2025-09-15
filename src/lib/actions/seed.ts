'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import {
  services,
  projects,
  articles,
  galleryImages,
  events,
  jobs,
  testimonials,
} from '@/lib/mock-data';

// Helper function to clear a collection
async function clearCollection(collectionName: string) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Collection ${collectionName} cleared.`);
}

// Helper function to seed a collection
async function seedCollection(collectionName: string, data: any[]) {
  const collectionRef = collection(db, collectionName);
  const batch = writeBatch(db);
  data.forEach((item) => {
    const itemCopy = { ...item };
    // Firestore can't store functions/React components, so we convert icon component to string name
    if (collectionName === 'services' && typeof itemCopy.icon !== 'string') {
        itemCopy.icon = itemCopy.icon.displayName || 'BrainCircuit';
    }
    const { id, ...rest } = itemCopy;
    const docRef = doc(collectionRef, id);
    batch.set(docRef, rest);
  });
  await batch.commit();
  console.log(`Collection ${collectionName} seeded with ${data.length} items.`);
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Define all collections and their data
    const collectionsToSeed = [
      { name: 'services', data: services },
      { name: 'projects', data: projects },
      { name: 'articles', data: articles },
      { name: 'gallery', data: galleryImages },
      { name: 'events', data: events },
      { name: 'jobs', data: jobs },
      { name: 'testimonials', data: testimonials },
    ];

    // Clear and seed each collection
    for (const { name, data } of collectionsToSeed) {
      await clearCollection(name);
      await seedCollection(name, data);
    }

    console.log('Database seeding completed successfully.');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
      return { success: false, message: `Error seeding database: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred during seeding.' };
  }
}
