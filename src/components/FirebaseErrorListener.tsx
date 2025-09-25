'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a client component that listens for Firestore permission errors
// and displays them as toasts during development. This is crucial for
// debugging security rules.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toString());
      if (process.env.NODE_ENV === 'development') {
        toast({
          variant: 'destructive',
          title: 'Firestore Permission Error',
          description: error.toString(),
          duration: 10000,
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
