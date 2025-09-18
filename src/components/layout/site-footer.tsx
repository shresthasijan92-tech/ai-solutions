import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Your Partner in AI-Powered Innovation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:flex md:justify-end">
            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-semibold">Explore</h4>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Services</Link>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary">Projects</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-semibold">Company</h4>
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
              <Link href="/feedback" className="text-sm text-muted-foreground hover:text-primary">Feedback</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="GitHub"><Github className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
