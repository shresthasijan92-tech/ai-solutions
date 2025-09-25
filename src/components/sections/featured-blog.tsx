import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getArticles } from '@/lib/articles';
import { articles as mockArticles } from '@/lib/mock-data';
import { Timestamp } from 'firebase/firestore';

const toDate = (timestamp: string | Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export async function FeaturedBlog() {
  const allArticles = await getArticles();
  const featuredArticlesFromDb = allArticles.filter((article) => article.featured);
  const featuredArticles = featuredArticlesFromDb.length > 0 ? featuredArticlesFromDb : mockArticles.filter(a => a.featured);

  if (featuredArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold">From the Blog</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">
              Read All Articles <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {featuredArticles.map((article) => {
            const articleLink = `/blog/${article.id}`;
             return (
              <Card key={article.id} className="overflow-hidden group flex flex-col">
                <CardHeader className="p-0">
                  <Link href={articleLink} className="block relative h-48 w-full overflow-hidden">
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
                    <Link href={articleLink} className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground flex-grow">{article.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{toDate(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto self-start" asChild>
                        <Link href={articleLink}>
                            Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}
