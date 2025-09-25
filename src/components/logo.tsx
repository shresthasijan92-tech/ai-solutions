import Link from 'next/link';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
    >
      <svg
        className="h-7 w-7 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 0 0-10 10c0 5 4.5 9 10 9s10-4 10-9A10 10 0 0 0 12 2Z" />
        <path d="M12 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
        <path d="M12 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
        <path d="M12 12a2 2 0 1 0-4 0" />
        <path d="M12 12a2 2 0 1 0 4 0" />
        <path d="M12 2v4" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76-2.83 2.83" />
      </svg>
      <span className="font-headline text-lg font-bold">AI Solutions</span>
    </Link>
  );
}
