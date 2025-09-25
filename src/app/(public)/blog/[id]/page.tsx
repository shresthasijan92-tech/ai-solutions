import { getArticles } from '@/lib/articles';
import { articles as mockArticles } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const articlesFromDb = await getArticles();
  const allArticles = articlesFromDb.length > 0 ? articlesFromDb : mockArticles;
  const article = allArticles.find(a => a.id === params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-20">
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
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{toDate(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        
        {article.imageUrl && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                />
            </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert max-w-none mx-auto" 
          dangerouslySetInnerHTML={{ __html: article.content || article.excerpt }}
        >
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const articlesFromDb = await getArticles();
  const articles = articlesFromDb.length > 0 ? articlesFromDb : mockArticles;
 
  return articles.map((article) => ({
    id: article.id,
  }));
}
