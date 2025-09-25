
import { getArticle, getArticles } from '@/lib/articles';
import { articles as mockArticles } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { ArticleRenderer } from '@/components/article-renderer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
            </Link>
        </Button>
        <article>
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

            <ArticleRenderer content={article.content || article.excerpt} />
        </article>
      </div>
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
