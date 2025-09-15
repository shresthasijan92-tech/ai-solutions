import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Article } from './definitions';

export async function getArticles(): Promise<Article[]> {
  const articlesCol = collection(db, 'articles');
  const q = query(articlesCol);
  const articlesSnapshot = await getDocs(q);
  const articlesList = articlesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      excerpt: data.excerpt,
      imageId: data.imageId,
      publishedAt: data.publishedAt,
      featured: data.featured || false,
    } as Article;
  });
  return articlesList;
}
