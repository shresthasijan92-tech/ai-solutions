'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Article } from '../definitions';

export type ArticleFormState = {
  message: string;
  success: boolean;
};

type ArticleData = Omit<Article, 'id' | 'publishedAt'> & { publishedAt: string };

function revalidateArticlePaths(id?: string) {
  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  if (id) revalidatePath(`/blog/${id}`);
  revalidatePath('/');
}

export async function createArticle(data: ArticleData): Promise<ArticleFormState> {
  try {
    const payload = {
      ...data,
      featured: data.featured || false,
      publishedAt: Timestamp.fromDate(new Date(data.publishedAt)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'articles'), payload);

    revalidateArticlePaths();
    return { message: 'Successfully created article.', success: true };
  } catch (error) {
    console.error('Create Article Error:', error);
    return { message: 'Failed to create article.', success: false };
  }
}

export async function updateArticle(id: string, data: ArticleData): Promise<ArticleFormState> {
  if (!id) return { message: 'Failed to update article: Missing ID.', success: false };

  try {
    const payload = {
      ...data,
      featured: data.featured || false,
      publishedAt: Timestamp.fromDate(new Date(data.publishedAt)),
      updatedAt: serverTimestamp(),
    };

    const articleDocRef = doc(firestore, 'articles', id);
    await updateDoc(articleDocRef, payload);

    revalidateArticlePaths(id);
    return { message: 'Successfully updated article.', success: true };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete article: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'articles', id));
    revalidateArticlePaths(id);
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Article Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
