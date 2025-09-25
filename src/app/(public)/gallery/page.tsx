'use client';

import { useState, useEffect } from 'react';
import { getGalleryImages } from '@/lib/gallery';
import Image from 'next/image';
import { galleryImages as mockGalleryImages } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GalleryImage, GalleryCategory } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

const categories: GalleryCategory[] = ["All", "Events", "Tech Solutions", "Team Collaboration"];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All");

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true);
      const imagesFromDb = await getGalleryImages();
      const images = imagesFromDb.length > 0 ? imagesFromDb : mockGalleryImages;
      setGalleryImages(images);
      setIsLoading(false);
    }
    loadImages();
  }, []);

  const filteredImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeCategory);

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-4">Gallery</h1>
      <p className="text-muted-foreground mb-8">
        A visual journey through our projects, team culture, and events.
      </p>

      <div className="flex justify-center flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <p className="text-center py-10">No images found for this category.</p>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredImages.map((galleryImage) => (
            <div key={galleryImage.id} className="relative break-inside-avoid overflow-hidden rounded-lg group">
              {galleryImage.imageUrl && (
                <Image
                  src={galleryImage.imageUrl}
                  alt={galleryImage.title}
                  width={500}
                  height={500}
                  className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                <p className="text-white font-headline text-lg">{galleryImage.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
