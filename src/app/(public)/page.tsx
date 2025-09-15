import { Hero } from '@/components/sections/hero';
import { FeaturedServices } from '@/components/sections/featured-services';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { FeaturedBlog } from '@/components/sections/featured-blog';
import { FeaturedGallery } from '@/components/sections/featured-gallery';
import { FeaturedEvents } from '@/components/sections/featured-events';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <FeaturedProjects />
      <FeaturedBlog />
      <FeaturedGallery />
      <FeaturedEvents />
    </>
  );
}
