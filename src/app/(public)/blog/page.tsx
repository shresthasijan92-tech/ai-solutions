import { getArticles } from '@/lib/articles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { articles as mockArticles } from '@/lib/mock-data';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export default async function BlogPage() {
  const articlesFromDb = await getArticles();
  const articles = articlesFromDb.length > 0 ? articlesFromDb : mockArticles;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Blog</h1>
       {articles.length === 0 ? (
        <p>No articles found. The database might be empty. You can add articles in the admin panel.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {articles.map((article) => {
             const articleLink = article.fullArticleUrl || `/blog/${article.id}`;
             return (
              <Card key={article.id} className="overflow-hidden group flex flex-col">
                <CardHeader className="p-0">
                  <Link href={articleLink} target={article.fullArticleUrl ? '_blank' : '_self'} rel="noopener noreferrer" className="block relative h-48 w-full overflow-hidden">
                    {article.imageUrl && (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-headline text-xl mb-2 font-semibold leading-tight">
                    <Link href={articleLink} target={article.fullArticleUrl ? '_blank' : '_self'} rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground flex-grow">{article.excerpt}</p>
                   <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{toDate(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {article.fullArticleUrl && (
                        <Button variant="link" className="p-0 h-auto self-start" asChild>
                           <Link href={article.fullArticleUrl} target="_blank" rel="noopener noreferrer">
                                Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
