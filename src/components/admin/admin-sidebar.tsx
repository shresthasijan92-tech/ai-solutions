'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, FileText, Image as ImageIcon, Calendar, MessageSquare, Lightbulb, MailQuestion, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '../ui/button';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: FileText },
  { href: '/admin/articles', label: 'Articles', icon: Lightbulb },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/inquiries', label: 'Contacts', icon: MailQuestion },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="mb-8">
        <Logo href="/admin" />
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
         <Button variant="ghost" onClick={handleLogout} className="justify-start px-3 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4 mr-3" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
