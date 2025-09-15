import { AdminSidebar } from '@/components/admin/admin-sidebar';

// In a real application, this layout would be protected by authentication middleware.
// For this demo, we assume the user is authenticated if they reach this layout.

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
