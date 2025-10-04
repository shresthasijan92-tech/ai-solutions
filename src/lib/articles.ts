'use server';
import { firestore } from '@/firebase/server';
import {
  collection,
  getDocs,
  query,
  Timestamp,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import type { Article } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

// Helper function to safely convert Firestore Timestamps
const toISOStringIfTimestamp = (value: any): string | any => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
};


export async function getArticles(): Promise<Article[]> {
  if (!isFirebaseConfigured) {
    return [];
  }
  try {
    const articlesCol = collection(firestore, 'articles');
    const q = query(articlesCol, orderBy('publishedAt', 'desc'));
    const articlesSnapshot = await getDocs(q);
    const articlesList = articlesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const articleData = {
        ...data,
        publishedAt: toISOStringIfTimestamp(data.publishedAt),
        createdAt: toISOStringIfTimestamp(data.createdAt),
        updatedAt: toISOStringIfTimestamp(data.updatedAt),
      };

      return {
        id: doc.id,
        ...articleData,
      } as Article;
    });
    return articlesList;
  } catch (error) {
    console.error('Error fetching articles from Firestore:', error);
    return [];
  }
}

export async function getArticle(id: string): Promise<Article | null> {
    if (!isFirebaseConfigured) {
    return null;
  }
  try {
    const articleDocRef = doc(firestore, 'articles', id);
    const docSnap = await getDoc(articleDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const articleData = {
      ...data,
      publishedAt: toISOStringIfTimestamp(data.publishedAt),
      createdAt: toISOStringIfTimestamp(data.createdAt),
      updatedAt: toISOStringIfTimestamp(data.updatedAt),
    };

    return {
      id: docSnap.id,
      ...articleData,
    } as Article;
  } catch (error) {
    console.error(`Error fetching article ${id} from Firestore:`, error);
    return null;
  }
}
