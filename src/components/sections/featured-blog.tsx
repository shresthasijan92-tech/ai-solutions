import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarIcon } from 'lucide-react';
import { articles } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FeaturedBlog() {
  const featuredArticles = articles.filter((article) => article.featured);

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
             const image = PlaceHolderImages.find(p => p.id === article.imageId);
             return (
              <Card key={article.id} className="overflow-hidden group flex flex-col">
                <CardHeader className="p-0">
                  <Link href={`/blog/${article.id}`} className="block relative h-48 w-full overflow-hidden">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-headline text-xl mb-2 font-semibold leading-tight">
                    <Link href={`/blog/${article.id}`} className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground flex-grow">{article.excerpt}</p>
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
