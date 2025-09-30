
'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-secondary p-8">{children}</main>
    </div>
  );
}
