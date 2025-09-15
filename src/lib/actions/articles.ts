'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, app } from '@/lib/firebase';
import {
  getStorage,
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
  Timestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';

const storage = getStorage(app);

const ArticleActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  publishedAt: z.date(),
  featured: z.boolean(),
});

export type ArticleFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof ArticleActionSchema>>['formErrors']['fieldErrors'];
  success?: boolean;
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

export async function createArticle(
  data: z.infer<typeof ArticleActionSchema>
): Promise<ArticleFormState> {
  const validatedFields = ArticleActionSchema.safeParse(data);

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
    
    const articlesCollection = collection(db, 'articles');
    await addDoc(articlesCollection, {
      ...rest,
      imageUrl: finalImageUrl,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Article.',
      success: false,
    };
  }

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  revalidatePath('/');
  return { message: 'Successfully created article.', success: true };
}

export async function updateArticle(
  id: string,
  data: z.infer<typeof ArticleActionSchema>
): Promise<ArticleFormState> {
  const validatedFields = ArticleActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    const articleDocRef = doc(db, 'articles', id);
    const existingDoc = await getDoc(articleDocRef);

    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'articles');
      
      if (existingDoc.exists()) {
        const existingData = existingDoc.data();
        if (existingData?.imageUrl && existingData.imageUrl.includes('firebasestorage')) {
          try {
              const oldImageRef = ref(storage, existingData.imageUrl);
              await deleteObject(oldImageRef);
          } catch (storageError: any) {
              if (storageError.code !== 'storage/object-not-found') {
                  console.warn('Could not delete old image, may not exist:', storageError);
              }
          }
        }
      }
    }
    
    const articleData = {
        ...rest,
        imageUrl: finalImageUrl,
        publishedAt: Timestamp.fromDate(rest.publishedAt),
    };

    if (existingDoc.exists()) {
        await updateDoc(articleDocRef, articleData);
    } else {
        await setDoc(articleDocRef, articleData);
    }

  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Update Article.',
      success: false,
    };
  }

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  revalidatePath('/');
  return { message: 'Successfully updated article.', success: true };
}

async function deleteImageFromStorage(imageUrl: string) {
    if (imageUrl.includes('firebasestorage')) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.warn("Image to delete was not found in storage.");
            } else {
                throw error;
            }
        }
    }
}

export async function deleteArticle(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const articleDocRef = doc(db, 'articles', id);
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
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return {
      message: 'Database Error: Failed to Delete Article.',
      success: false,
    };
  }
}
