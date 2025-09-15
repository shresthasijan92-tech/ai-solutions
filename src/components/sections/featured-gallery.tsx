import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { galleryImages } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export function FeaturedGallery() {
  const featuredImages = galleryImages.filter((image) => image.featured).slice(0, 3);

  return (
    <section className="bg-secondary py-12 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold">Gallery</h2>
          <Button variant="ghost" asChild>
            <Link href="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {featuredImages.map((galleryImage, index) => {
            const image = PlaceHolderImages.find(p => p.id === galleryImage.imageId);
            return (
              <div key={galleryImage.id} className="relative aspect-square overflow-hidden rounded-lg group">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={galleryImage.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-headline text-lg">{galleryImage.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
