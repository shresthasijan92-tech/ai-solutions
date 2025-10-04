import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getGalleryImages } from '@/lib/gallery';
import { Button } from '@/components/ui/button';
import { isFirebaseConfigured } from '@/firebase/config';

export async function FeaturedGallery() {
  if (!isFirebaseConfigured) return null;

  const allImages = await getGalleryImages();
  const imagesToDisplay = allImages.filter((image) => image.featured).slice(0, 4);

  if (imagesToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary py-12 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold">Gallery</h2>
          <Button variant="ghost" asChild>
            <Link href="/gallery">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagesToDisplay.map((galleryImage) => {
            return (
              <div key={galleryImage.id} className="relative aspect-[4/3] overflow-hidden rounded-lg group">
                {galleryImage.imageUrl && (
                  <Image
                    src={galleryImage.imageUrl}
                    alt={galleryImage.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <p className="text-white font-headline text-lg text-center">{galleryImage.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
