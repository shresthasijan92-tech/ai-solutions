
'use client';

export function ArticleRenderer({ content }: { content: string }) {
  return (
    <>
      <style jsx global>{`
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          font-family: 'Space Grotesk', sans-serif;
        }
        .prose p, .prose li, .prose blockquote, .prose a {
          font-family: 'Inter', sans-serif;
        }
        .prose a {
          color: hsl(var(--primary));
          text-decoration: none;
        }
        .prose a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mx-auto" 
        dangerouslySetInnerHTML={{ __html: content }}
      >
      </div>
    </>
  );
}
