'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '../definitions';

export type ServiceFormState = {
  message: string;
  success: boolean;
};

// Simplified Service data type for actions
type ServiceData = Omit<Service, 'id'>;

function revalidateServicePaths(id?: string) {
  revalidatePath('/admin/services');
  revalidatePath('/services');
  if (id) revalidatePath(`/services/${id}`);
  revalidatePath('/');
}

export async function createService(data: ServiceData): Promise<ServiceFormState> {
  try {
    const payload = {
      ...data,
      benefits: data.benefits || [],
      featured: data.featured || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'services'), payload);

    revalidateServicePaths();
    return { message: 'Successfully created service.', success: true };
  } catch (error) {
    console.error('Create Service Error:', error);
    return { message: 'Failed to create service on server.', success: false };
  }
}

export async function updateService(id: string, data: ServiceData): Promise<ServiceFormState> {
  if (!id) return { message: 'Failed to update service: Missing ID.', success: false };

  try {
    const payload = {
      ...data,
      benefits: data.benefits || [],
      featured: data.featured || false,
      updatedAt: serverTimestamp(),
    };

    const serviceDocRef = doc(firestore, 'services', id);
    await updateDoc(serviceDocRef, payload);

    revalidateServicePaths(id);
    return { message: 'Successfully updated service.', success: true };
  } catch (error) {
    console.error('Update Service Error:', error);
    return { message: 'Failed to update service on server.', success: false };
  }
}

export async function deleteService(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete service: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'services', id));
    revalidateServicePaths(id);
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    console.error('Delete Service Error:', error);
    return { message: 'Failed to delete service.', success: false };
  }
}
