'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, FileText, Image as ImageIcon, Calendar, Users, MessageSquare, BriefcaseBusiness } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: FileText },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/careers', label: 'Careers', icon: BriefcaseBusiness },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="mb-8">
        <Logo href="/admin" />
      </div>
      <nav className="flex flex-col gap-2">
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
      <div className="mt-auto">
        <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
            Back to Site
        </Link>
      </div>
    </aside>
  );
}
