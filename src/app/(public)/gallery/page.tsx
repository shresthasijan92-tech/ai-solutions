import { getGalleryImages } from '@/lib/gallery';
import Image from 'next/image';
import { galleryImages as mockGalleryImages } from '@/lib/mock-data';

export default async function GalleryPage() {
  const galleryImagesFromDb = await getGalleryImages();
  const galleryImages = galleryImagesFromDb.length > 0 ? galleryImagesFromDb : mockGalleryImages;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Gallery</h1>
      {galleryImages.length === 0 ? (
         <p>No images found. The database might be empty. You can add images in the admin panel.</p>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((galleryImage) => {
            return (
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
            );
          })}
        </div>
      )}
    </div>
  );
}
