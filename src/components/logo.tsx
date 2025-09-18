import Link from 'next/link';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
    >
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 22H22L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      </svg>
      <span className="font-headline text-lg font-bold">AI Solutions</span>
    </Link>
  );
}
