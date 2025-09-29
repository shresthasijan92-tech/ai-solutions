
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ArticleCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.coerce.date(),
  featured: z.boolean(),
  imageFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'An image file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

const ArticleUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.coerce.date(),
  featured: z.boolean(),
  imageUrl: z.string().url().optional(),
});

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleCreateSchema>, string[]>>;
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `articles/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage')) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn('Image to delete was not found in storage:', imageUrl);
      } else {
        throw error;
      }
    }
  }
}

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const validatedFields = ArticleCreateSchema.safeParse({
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
    imageFile: formData.get('imageFile'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile);
    
    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, {
        ...rest,
        imageUrl: imageUrl,
        publishedAt: Timestamp.fromDate(rest.publishedAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully created article.', success: true };
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

  try {
    const articleDocRef = doc(firestore, 'articles', id);
    const existingDocSnap = await getDoc(articleDocRef);
    if (!existingDocSnap.exists()) {
      return { message: 'Article not found.', success: false };
    }
    const existingData = existingDocSnap.data();

    const imageFile = formData.get('imageFile') as File | null;
    let newImageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const fileValidation = ArticleCreateSchema.shape.imageFile.safeParse(imageFile);
      if (!fileValidation.success) {
        return {
          message: 'Invalid image file.',
          errors: { imageFile: fileValidation.error.flatten().formErrors },
          success: false,
        };
      }
      newImageUrl = await uploadImage(imageFile);
    }
    
    const dataToValidate = {
      title: formData.get('title'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      publishedAt: formData.get('publishedAt'),
      featured: formData.get('featured') === 'on',
      imageUrl: newImageUrl ?? existingData.imageUrl,
    };

    const validatedFields = ArticleUpdateSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
      if (newImageUrl) {
        await deleteImageFromStorage(newImageUrl);
      }
      return {
        message: 'Failed to update article. Please check the form.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    await updateDoc(articleDocRef, {
        ...validatedFields.data,
        publishedAt: Timestamp.fromDate(validatedFields.data.publishedAt),
        updatedAt: serverTimestamp(),
    });

    if (newImageUrl && existingData.imageUrl) {
      await deleteImageFromStorage(existingData.imageUrl);
    }

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated article.', success: true };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete article: Missing ID.', success: false };
  }
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
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
