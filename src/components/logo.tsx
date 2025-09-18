import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
      <BrainCircuit className="h-6 w-6" />
      <span className="font-headline text-lg font-bold">
        AI Solutions
      </span>
    </Link>
  );
}
