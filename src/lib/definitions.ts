import type { LucideIcon } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  benefits?: string[];
  price?: string;
  featured: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  featured: boolean;
  link: string;
};

export type Article = {
  id:string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string | Timestamp | Date;
  featured: boolean;
  fullArticleUrl?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  imageUrl: string;
  featured: boolean;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  featured: boolean;
};

export type Job = {
  id: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
};

export type Testimonial = {
  id: string;
  name: string;
  company: string;
  feedback: string;
  rating: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type Contact = {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  contactNumber?: string;
  projectDetails: string;
  submittedAt: string;
};
