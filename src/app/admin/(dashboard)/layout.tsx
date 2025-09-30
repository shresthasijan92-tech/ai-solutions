'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase'; // Import the useUser hook

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser(); // Use the hook to get user and loading state

  useEffect(() => {
    // If the initial user check is complete and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // While checking for the user, show a loading state.
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  // If the user is authenticated, render the admin layout
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-secondary p-8">{children}</main>
    </div>
  );
}
