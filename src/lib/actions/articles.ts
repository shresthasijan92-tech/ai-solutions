'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  imageUrl: z.string().min(1, 'Image is required'),
  publishedAt: z.date({ coerce: true }),
  featured: z.boolean(),
});

export type ArticleFormState = {
  message: string;
  errors?: z.ZodError<
    z.infer<typeof ArticleSchema>
  >['formErrors']['fieldErrors'];
  success: boolean;
};

async function handleImageUpload(
  dataUri: string,
  folder: string
): Promise<string> {
  const fileName = `${folder}/${Date.now()}`;
  const storageRef = ref(storage, fileName);
  const uploadResult = await uploadString(storageRef, dataUri, 'data_url');
  return getDownloadURL(uploadResult.ref);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl.includes('firebasestorage')) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn('Image to delete was not found in storage.');
      } else {
        throw error;
      }
    }
  }
}

async function parseAndValidateFormData(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
  };
  return ArticleSchema.safeParse(rawData);
}

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const validatedFields = await parseAndValidateFormData(formData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'articles');
    }

    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, {
      ...rest,
      imageUrl: finalImageUrl,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully created article.', success: true, errors: {} };
  } catch (error) {
    console.error('Create Article Error:', error);
    return { message: 'Failed to create article.', success: false };
  }
}

export async function updateArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const id = formData.get('id') as string;
  if (!id) {
    return { message: 'Failed to update article: Missing ID.', success: false };
  }

  const validatedFields = await parseAndValidateFormData(formData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;
  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const payload: Record<string, any> = {
      ...rest,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
      updatedAt: serverTimestamp(),
    };

    if (imageUrl.startsWith('data:image')) {
      const docSnap = await getDoc(articleDocRef);
      if (docSnap.exists() && docSnap.data().imageUrl) {
        await deleteImageFromStorage(docSnap.data().imageUrl);
      }
      finalImageUrl = await handleImageUpload(imageUrl, 'articles');
      payload.imageUrl = finalImageUrl;
    } else {
      payload.imageUrl = imageUrl;
    }

    await updateDoc(articleDocRef, payload);

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated article.', success: true, errors: {} };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(
  id: string
): Promise<{ message: string; success: boolean }> {
  try {
    const articleDocRef = doc(firestore, 'articles', id);
    const docSnap = await getDoc(articleDocRef);

    if (docSnap.exists()) {
      const { imageUrl } = docSnap.data();
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
    }

    await deleteDoc(articleDocRef);
    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
