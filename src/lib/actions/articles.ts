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

// Base schema for validation
const BaseArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.date({ coerce: true }),
  featured: z.boolean(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (file) => !file || file.type === '' || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

// Schema for creating, where an image is required (either URL or file)
const CreateArticleSchema = BaseArticleSchema.refine(
  (data) => (data.imageUrl && data.imageUrl.length > 0) || (data.imageFile && data.imageFile.size > 0),
  {
    message: 'An image is required. Please provide a URL or upload a file.',
    path: ['imageUrl'],
  }
);

// Schema for updating
const UpdateArticleSchema = BaseArticleSchema;

export type ArticleFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof BaseArticleSchema>>['formErrors']['fieldErrors'];
  success: boolean;
};

// Helper to upload image from File object
async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `articles/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

// Helper to delete an image from storage
async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage')) {
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

// Helper to parse FormData
function parseFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    content: formData.get('content') as string,
    publishedAt: formData.get('publishedAt') as string,
    featured: formData.get('featured') === 'on',
    imageUrl: formData.get('imageUrl') as string,
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = CreateArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, imageUrl, ...rest } = validatedFields.data;
  const payload: Record<string, any> = {
    ...rest,
    publishedAt: Timestamp.fromDate(rest.publishedAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
    } else {
      payload.imageUrl = imageUrl;
    }

    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, payload);

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
  
  const rawData = {
    ...parseFormData(formData),
    prevImageUrl: formData.get('prevImageUrl') as string,
  };
  const validatedFields = UpdateArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, imageUrl, ...rest } = validatedFields.data;
  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const payload: Record<string, any> = {
      ...rest,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
        // A new file is uploaded, so upload it and delete the old one.
        const docSnap = await getDoc(articleDocRef);
        if (docSnap.exists() && docSnap.data().imageUrl) {
            await deleteImageFromStorage(docSnap.data().imageUrl);
        }
        payload.imageUrl = await uploadImage(imageFile);
    } else {
        // No new file. Use the URL from the form if provided, otherwise preserve the old one.
        // This allows clearing the image by submitting an empty URL.
        payload.imageUrl = imageUrl;
    }
    
    // If an explicit URL is provided in the form, it takes precedence.
    if (typeof imageUrl === 'string' && imageUrl) {
      payload.imageUrl = imageUrl;
    } else if (!imageFile) {
      // If no file and no new URL, keep the previous one from hidden input.
      payload.imageUrl = rawData.prevImageUrl;
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
