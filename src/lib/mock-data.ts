import { BrainCircuit, Bot, LineChart, Code, TestTube2, Layers3 } from 'lucide-react';
import type { Service, Project, Article, GalleryImage, Event, Job, Testimonial } from './definitions';
import { Timestamp } from 'firebase/firestore';

export const services: Service[] = [
  { id: 's1', title: 'AI Strategy Consulting', description: 'Develop a roadmap for AI integration tailored to your business goals.', icon: 'BrainCircuit', imageUrl: 'https://picsum.photos/seed/s1/600/400', benefits: ['Competitive Advantage', 'ROI-focused plan', 'Risk Mitigation'], price: 'Starting at $5,000', featured: true },
  { id: 's2', title: 'Custom AI Model Development', description: 'Build bespoke machine learning models to solve your unique challenges.', icon: 'Bot', imageUrl: 'https://picsum.photos/seed/s2/600/400', benefits: ['Tailored Solutions', 'High Accuracy', 'Scalable Architecture'], price: 'Starting at $15,000', featured: true },
  { id: 's3', title: 'Data Analytics & Visualization', description: 'Unlock insights from your data with advanced analytics and intuitive dashboards.', icon: 'LineChart', imageUrl: 'https://picsum.photos/seed/s3/600/400', benefits: ['Actionable Insights', 'Data-driven Decisions', 'Performance Tracking'], price: 'Starting at $7,500', featured: true },
  { id: 's4', title: 'Natural Language Processing', description: 'Implement solutions for sentiment analysis, chatbots, and text summarization.', icon: 'Code', imageUrl: 'https://picsum.photos/seed/s4/600/400', benefits: ['Enhanced Customer Service', 'Automated Processes', 'Insightful Text Analysis'], price: 'Starting at $10,000', featured: false },
  { id: 's5', title: 'Computer Vision Solutions', description: 'Leverage image and video analysis for automation and quality control.', icon: 'TestTube2', imageUrl: 'https://picsum.photos/seed/s5/600/400', benefits: ['Improved Efficiency', 'Error Reduction', 'Automated Inspection'], price: 'Starting at $12,000', featured: false },
  { id: 's6', title: 'AI Integration Services', description: 'Seamlessly integrate AI capabilities into your existing software and workflows.', icon: 'Layers3', imageUrl: 'https://picsum.photos/seed/s6/600/400', benefits: ['Modernized Systems', 'Streamlined Operations', 'Enhanced Functionality'], price: 'Starting at $8,000', featured: false },
];

export const projects: Project[] = [
  { id: 'p1', title: 'E-commerce Recommendation Engine', description: 'Increased customer engagement and sales by 20% with a personalized product recommendation system.', imageUrl: 'https://picsum.photos/seed/ecommerce/600/400', technologies: ['Python', 'TensorFlow', 'Firebase'], featured: true, link: '/projects/p1' },
  { id: 'p2', title: 'Predictive Maintenance for Manufacturing', description: 'Reduced equipment downtime by 30% by predicting failures before they happen.', imageUrl: 'https://picsum.photos/seed/manufacturing/600/400', technologies: ['SCIKIT-LEARN', 'Pandas', 'Next.js'], featured: true, link: '/projects/p2' },
  { id: 'p3', title: 'Automated Customer Support Chatbot', description: 'Improved customer satisfaction by providing instant, 24/7 support and resolving 80% of inquiries.', imageUrl: 'https://picsum.photos/seed/p3/600/400', technologies: ['Google Dialogflow', 'Node.js', 'React'], featured: true, link: '/projects/p3' },
  { id: 'p4', title: 'Retail Foot-Traffic Analysis', description: 'Optimized store layouts and marketing campaigns using computer vision to analyze customer behavior.', imageUrl: 'https://picsum.photos/seed/p4/600/400', technologies: ['OpenCV', 'YOLO', 'Google Cloud'], featured: false, link: '/projects/p4' },
];

export const articles: Article[] = [
  { id: 'a1', title: 'The Generative AI Revolution: What It Means for Your Business', excerpt: 'Explore how generative AI is reshaping industries and how you can leverage it for a competitive edge.', imageUrl: 'https://picsum.photos/seed/ai-business/600/400', publishedAt: '2024-07-15', featured: true, fullArticleUrl: 'https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/07/24/ai-powered-success-with-1000-stories-of-customer-transformation-and-innovation/' },
  { id: 'a2', title: '5 Common Pitfalls to Avoid in Your Next Machine Learning Project', excerpt: 'Learn from common mistakes to ensure your ML projects are successful and deliver real value.', imageUrl: 'https://howays.com/wp-content/uploads/2024/08/NTT_DATA_Google_Cloud_AI_partnership_digital_transformation_data_sovereignty-1024x683.png', publishedAt: '2024-06-28', featured: true, fullArticleUrl: 'https://howays.com/wp-content/uploads/2024/08/NTT_DATA_Google_Cloud_AI_partnership_digital_transformation_data_sovereignty-1024x683.png' },
  { id: 'a3', title: 'An Introduction to Genkit and the Future of AI Development', excerpt: "A deep dive into Google's new Genkit framework and how it simplifies building AI-powered applications.", imageUrl: 'https://cdn.sanity.io/images/0vv8moc6/medec/8022c91678b2731dffb6b564ec54ab428b93dc1e-5376x3584.jpg?fit=crop&auto=format', publishedAt: '2024-06-10', featured: true, fullArticleUrl: 'https://images.yourstory.com/cs/2/96eabe90392211eb93f18319e8c07a74/NucleusAIStudentstudyingwithAItutorachievinga94examsf5096b24-294c-4521-b257-9924a4bd07d4-1681899381357.png?mode=crop&crop=faces&ar=2%3A1&format=auto&w=1920&q=75' },
];

export const galleryImages: GalleryImage[] = [
  { id: 'g1', title: 'Team Collaboration', imageUrl: 'https://picsum.photos/seed/teamwork/400/600', featured: true },
  { id: 'g2', title: 'Office Environment', imageUrl: 'https://picsum.photos/seed/g2/600/400', featured: true },
  { id: 'g3', title: 'AI Conference Talk', imageUrl: 'https://picsum.photos/seed/g3/600/400', featured: true },
  { id: 'g4', title: 'Data Insights', imageUrl: 'https://picsum.photos/seed/g4/600/400', featured: false },
  { id: 'g5', title: 'Robotics Lab', imageUrl: 'https://picsum.photos/seed/g5/400/600', featured: false },
  { id: 'g6', title: 'Pair Programming', imageUrl: 'https://picsum.photos/seed/g6/600/400', featured: false },
];

export const events: Event[] = [
  { id: 'e1', title: 'Webinar: AI for UK Businesses', date: '2025-10-15', location: 'Online', description: 'A free webinar covering practical AI applications for small and medium-sized businesses.', featured: true },
  { id: 'e2', title: 'AI Innovation Summit', date: '2025-11-20', location: 'Manchester, UK', description: "Join us at the premier event for AI professionals and enthusiasts. We'll be at booth #123.", featured: true },
  { id: 'e3', title: 'Tech Meetup: The Future of NLP', date: '2025-12-05', location: 'Edinburgh, UK', description: "Our lead data scientist will be giving a talk on the latest advancements in Natural Language Processing.", featured: false },
];

export const jobs: Job[] = [
    { id: 'j1', title: 'Senior AI Engineer', location: 'Remote', type: 'Full-time', description: 'Lead the development of cutting-edge AI models and solutions for our enterprise clients.' },
    { id: 'j2', title: 'Data Scientist', location: 'New York, NY', type: 'Full-time', description: 'Analyze large datasets to uncover insights, build predictive models, and drive business decisions.' },
    { id: 'j3', title: 'Frontend Developer (React/Next.js)', location: 'Remote', type: 'Contract', description: 'Join our team to build and maintain beautiful, performant user interfaces for our AI applications.' },
];

export const testimonials: Testimonial[] = [
    { id: 't1', name: 'Jane Doe', company: 'Innovate Corp', feedback: 'AI Solutions transformed our operations. Their custom AI model was a game-changer for our business.', rating: 5, createdAt: Timestamp.fromDate(new Date('2024-05-20')), status: 'approved' },
    { id: 't2', name: 'John Smith', company: 'TechForward', feedback: 'The team was incredibly professional and knowledgeable. They delivered beyond our expectations.', rating: 5, createdAt: Timestamp.fromDate(new Date('2024-04-12')), status: 'approved' },
    { id: 't3', name: 'Emily White', company: 'DataDriven Inc.', feedback: 'Their data analytics services provided the clarity we needed to scale our marketing efforts effectively.', rating: 4, createdAt: Timestamp.fromDate(new Date('2024-03-01')), status: 'approved' },
    { id: 't4', name: 'Michael Brown', company: 'NextGen Solutions', feedback: 'Working with AI Solutions was a great experience. Highly recommend their strategy consulting.', rating: 5, createdAt: Timestamp.fromDate(new Date('2024-06-30')), status: 'pending' },
];
