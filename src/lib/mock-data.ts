import { BrainCircuit, Bot, LineChart, Code, TestTube2, Layers3 } from 'lucide-react';
import type { Service, Project, Article, GalleryImage, Event, Job, Testimonial } from './definitions';

export const services: Service[] = [
  { id: 's1', title: 'AI Strategy Consulting', description: 'Develop a roadmap for AI integration tailored to your business goals.', icon: 'BrainCircuit', benefits: ['Competitive Advantage', 'ROI-focused plan', 'Risk Mitigation'], price: 'Starting at $5,000', featured: true },
  { id: 's2', title: 'Custom AI Model Development', description: 'Build bespoke machine learning models to solve your unique challenges.', icon: 'Bot', benefits: ['Tailored Solutions', 'High Accuracy', 'Scalable Architecture'], price: 'Starting at $15,000', featured: true },
  { id: 's3', title: 'Data Analytics & Visualization', description: 'Unlock insights from your data with advanced analytics and intuitive dashboards.', icon: 'LineChart', benefits: ['Actionable Insights', 'Data-driven Decisions', 'Performance Tracking'], price: 'Starting at $7,500', featured: true },
  { id: 's4', title: 'Natural Language Processing', description: 'Implement solutions for sentiment analysis, chatbots, and text summarization.', icon: 'Code', benefits: ['Enhanced Customer Service', 'Automated Processes', 'Insightful Text Analysis'], price: 'Starting at $10,000', featured: false },
  { id: 's5', title: 'Computer Vision Solutions', description: 'Leverage image and video analysis for automation and quality control.', icon: 'TestTube2', benefits: ['Improved Efficiency', 'Error Reduction', 'Automated Inspection'], price: 'Starting at $12,000', featured: false },
  { id: 's6', title: 'AI Integration Services', description: 'Seamlessly integrate AI capabilities into your existing software and workflows.', icon: 'Layers3', benefits: ['Modernized Systems', 'Streamlined Operations', 'Enhanced Functionality'], price: 'Starting at $8,000', featured: false },
];

export const projects: Project[] = [
  { id: 'p1', title: 'E-commerce Recommendation Engine', description: 'Increased customer engagement and sales by 20% with a personalized product recommendation system.', imageUrl: 'https://picsum.photos/seed/p1/600/400', technologies: ['Python', 'TensorFlow', 'Firebase'], featured: true, link: '/projects/p1' },
  { id: 'p2', title: 'Predictive Maintenance for Manufacturing', description: 'Reduced equipment downtime by 30% by predicting failures before they happen.', imageUrl: 'https://picsum.photos/seed/p2/600/400', technologies: ['SCIKIT-LEARN', 'Pandas', 'Next.js'], featured: true, link: '/projects/p2' },
  { id: 'p3', title: 'Automated Customer Support Chatbot', description: 'Improved customer satisfaction by providing instant, 24/7 support and resolving 80% of inquiries.', imageUrl: 'https://picsum.photos/seed/p3/600/400', technologies: ['Google Dialogflow', 'Node.js', 'React'], featured: true, link: '/projects/p3' },
  { id: 'p4', title: 'Retail Foot-Traffic Analysis', description: 'Optimized store layouts and marketing campaigns using computer vision to analyze customer behavior.', imageUrl: 'https://picsum.photos/seed/p4/600/400', technologies: ['OpenCV', 'YOLO', 'Google Cloud'], featured: false, link: '/projects/p4' },
];

export const articles: Article[] = [
  { id: 'a1', title: 'The Generative AI Revolution: What It Means for Your Business', excerpt: 'Explore how generative AI is reshaping industries and how you can leverage it for a competitive edge.', imageUrl: 'https://picsum.photos/seed/b1/600/400', publishedAt: '2024-07-15', featured: true },
  { id: 'a2', title: '5 Common Pitfalls to Avoid in Your Next Machine Learning Project', excerpt: 'Learn from common mistakes to ensure your ML projects are successful and deliver real value.', imageUrl: 'https://picsum.photos/seed/b2/600/400', publishedAt: '2024-06-28', featured: true },
  { id: 'a3', title: 'An Introduction to Genkit and the Future of AI Development', excerpt: 'A deep dive into Google\'s new Genkit framework and how it simplifies building AI-powered applications.', imageUrl: 'https://picsum.photos/seed/b3/600/400', publishedAt: '2024-06-10', featured: true },
];

export const galleryImages: GalleryImage[] = [
  { id: 'g1', title: 'Team Collaboration', imageUrl: 'https://picsum.photos/seed/g1/400/600', featured: true },
  { id: 'g2', title: 'Office Environment', imageUrl: 'https://picsum.photos/seed/g2/600/400', featured: true },
  { id: 'g3', title: 'AI Conference Talk', imageUrl: 'https://picsum.photos/seed/g3/600/400', featured: true },
  { id: 'g4', title: 'Data Insights', imageUrl: 'https://picsum.photos/seed/g4/600/400', featured: false },
  { id: 'g5', title: 'Robotics Lab', imageUrl: 'https://picsum.photos/seed/g5/400/600', featured: false },
  { id: 'g6', title: 'Pair Programming', imageUrl: 'https://picsum.photos/seed/g6/600/400', featured: false },
];

export const events: Event[] = [
  { id: 'e1', title: 'Webinar: AI for Small Businesses', date: '2024-08-15', location: 'Online', description: 'A free webinar covering practical AI applications for small and medium-sized businesses.', featured: true },
  { id: 'e2', title: 'AI Innovation Summit 2024', date: '2024-09-20', location: 'San Francisco, CA', description: 'Join us at the premier event for AI professionals and enthusiasts. We\'ll be at booth #123.', featured: true },
  { id: 'e3', title: 'Tech Meetup: The Future of NLP', date: '2024-10-05', location: 'New York, NY', description: 'Our lead data scientist will be giving a talk on the latest advancements in Natural Language Processing.', featured: false },
];

export const jobs: Job[] = [
    { id: 'j1', title: 'Senior AI Engineer', location: 'Remote', type: 'Full-time', description: 'Lead the development of cutting-edge AI models and solutions for our enterprise clients.' },
    { id: 'j2', title: 'Data Scientist', location: 'New York, NY', type: 'Full-time', description: 'Analyze large datasets to uncover insights, build predictive models, and drive business decisions.' },
    { id: 'j3', title: 'Frontend Developer (React/Next.js)', location: 'Remote', type: 'Contract', description: 'Join our team to build and maintain beautiful, performant user interfaces for our AI applications.' },
];

export const testimonials: Testimonial[] = [
    { id: 't1', name: 'Jane Doe', company: 'Innovate Corp', feedback: 'AI Solutions transformed our operations. Their custom AI model was a game-changer for our business.', rating: 5, createdAt: '2024-05-20', status: 'approved' },
    { id: 't2', name: 'John Smith', company: 'TechForward', feedback: 'The team was incredibly professional and knowledgeable. They delivered beyond our expectations.', rating: 5, createdAt: '2024-04-12', status: 'approved' },
    { id: 't3', name: 'Emily White', company: 'DataDriven Inc.', feedback: 'Their data analytics services provided the clarity we needed to scale our marketing efforts effectively.', rating: 4, createdAt: '2024-03-01', status: 'approved' },
    { id: 't4', name: 'Michael Brown', company: 'NextGen Solutions', feedback: 'Working with AI Solutions was a great experience. Highly recommend their strategy consulting.', rating: 5, createdAt: '2024-06-30', status: 'pending' },
];
