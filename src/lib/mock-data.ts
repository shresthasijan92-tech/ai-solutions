
import { BrainCircuit, Bot, LineChart, Code, TestTube2, Layers3 } from 'lucide-react';
import type { Service, Project, Article, GalleryImage, Event, Job, Testimonial } from './definitions';
import { Timestamp } from 'firebase/firestore';

export const services: Service[] = [
  { id: 's1', title: 'AI Strategy Consulting', description: 'Develop a roadmap for AI integration tailored to your business goals.', imageUrl: 'https://picsum.photos/seed/s1/600/400', benefits: ['Competitive Advantage', 'ROI-focused plan', 'Risk Mitigation'], price: 'Starting at $5,000', details: 'Our AI Strategy Consulting service provides a comprehensive analysis of your business to identify the most impactful AI opportunities. We work with you to create a strategic roadmap, outlining key initiatives, timelines, and expected ROI. This service is perfect for businesses looking to embark on their AI journey but are unsure where to to start.', featured: true },
  { id: 's2', title: 'Custom AI Model Development', description: 'Build bespoke machine learning models to solve your unique challenges.', imageUrl: 'https://picsum.photos/seed/s2/600/400', benefits: ['Tailored Solutions', 'High Accuracy', 'Scalable Architecture'], price: 'Starting at $15,000', details: 'We specialize in creating custom machine learning models from the ground up. Whether you need a recommendation engine, a predictive model, or a natural language processing solution, our team of experts will build a high-performance model that is tailored to your specific data and business needs.', featured: true },
  { id: 's3', title: 'Data Analytics & Visualization', description: 'Unlock insights from your data with advanced analytics and intuitive dashboards.', imageUrl: 'https://picsum.photos/seed/s3/600/400', benefits: ['Actionable Insights', 'Data-driven Decisions', 'Performance Tracking'], price: 'Starting at $7,500', details: 'Turn your raw data into a strategic asset. Our Data Analytics & Visualization service helps you make sense of complex datasets through interactive dashboards and in-depth analysis. We empower your team to make smarter, data-driven decisions that drive growth.', featured: true },
  { id: 's4', title: 'Natural Language Processing', description: 'Implement solutions for sentiment analysis, chatbots, and text summarization.', imageUrl: 'https://picsum.photos/seed/s4/600/400', benefits: ['Enhanced Customer Service', 'Automated Processes', 'Insightful Text Analysis'], price: 'Starting at $10,000', details: 'Harness the power of language with our NLP services. We can help you build intelligent chatbots, analyze customer feedback for sentiment, automatically summarize long documents, and much more. Improve efficiency and gain deeper insights from unstructured text data.', featured: false },
  { id: 's5', title: 'Computer Vision Solutions', description: 'Leverage image and video analysis for automation and quality control.', imageUrl: 'https://picsum.photos/seed/s5/600/400', benefits: ['Improved Efficiency', 'Error Reduction', 'Automated Inspection'], price: 'Starting at $12,000', details: 'Our Computer Vision services enable you to automate tasks that typically require human vision. From object detection in images and video to automated quality control on a manufacturing line, we can build a solution that enhances your operational efficiency and accuracy.', featured: false },
  { id: 's6', title: 'AI Integration Services', description: 'Seamlessly integrate AI capabilities into your existing software and workflows.', imageUrl: 'https://picsum.photos/seed/s6/600/400', benefits: ['Modernized Systems', 'Streamlined Operations', 'Enhanced Functionality'], price: 'Starting at $8,000', details: 'Bring the power of AI to your existing applications. Our AI Integration service helps you to seamlessly embed AI-powered features into your current software stack, enhancing functionality and modernizing your operations without the need for a complete overhaul.', featured: false },
];

export const projects: Project[] = [
  { id: 'p1', title: 'E-commerce Recommendation Engine', description: 'Increased customer engagement and sales by 20% with a personalized product recommendation system.', imageUrl: 'https://picsum.photos/seed/ecommerce/600/400', technologies: ['Python', 'TensorFlow', 'Firebase'], featured: true, caseStudy: 'Full case study content for E-commerce Recommendation Engine.' },
  { id: 'p2', title: 'Predictive Maintenance for Manufacturing', description: 'Reduced equipment downtime by 30% by predicting failures before they happen.', imageUrl: 'https://picsum.photos/seed/manufacturing/600/400', technologies: ['SCIKIT-LEARN', 'Pandas', 'Next.js'], featured: true, caseStudy: 'Full case study content for Predictive Maintenance.' },
  { id: 'p3', title: 'Automated Customer Support Chatbot', description: 'Improved customer satisfaction by providing instant, 24/7 support and resolving 80% of inquiries.', imageUrl: 'https://picsum.photos/seed/p3/600/400', technologies: ['Google Dialogflow', 'Node.js', 'React'], featured: true, caseStudy: 'Full case study content for Automated Customer Support Chatbot.' },
  { id: 'p4', title: 'Retail Foot-Traffic Analysis', description: 'Optimized store layouts and marketing campaigns using computer vision to analyze customer behavior.', imageUrl: 'https://picsum.photos/seed/p4/600/400', technologies: ['OpenCV', 'YOLO', 'Google Cloud'], featured: false, caseStudy: 'Full case study content for Retail Foot-Traffic Analysis.' },
];

export const articles: Article[] = [
  { id: 'a1', title: 'The Generative AI Revolution: What It Means for Your Business', excerpt: 'Explore how generative AI is reshaping industries and how you can leverage it for a competitive edge.', content: 'The full text of the article about the generative AI revolution goes here. It would discuss topics like large language models, their applications, and the strategic advantages they offer businesses.', imageUrl: 'https://picsum.photos/seed/ai-business/600/400', publishedAt: '2024-07-15', featured: true },
  { id: 'a2', title: '5 Common Pitfalls to Avoid in Your Next Machine Learning Project', excerpt: 'Learn from common mistakes to ensure your ML projects are successful and deliver real value.', content: 'This article would provide a detailed guide on the common challenges in ML projects, such as data quality issues, model overfitting, and lack of clear objectives. It would offer practical advice for each point.', imageUrl: 'https://howays.com/wp-content/uploads/2024/08/NTT_DATA_Google_Cloud_AI_partnership_digital_transformation_data_sovereignty-1024x683.png', publishedAt: '2024-06-28', featured: true },
  { id: 'a3', title: 'An Introduction to Genkit and the Future of AI Development', excerpt: "A deep dive into Google's new Genkit framework and how it simplifies building AI-powered applications.", content: "This article would serve as a tutorial for Genkit, explaining its core concepts, how to set up a project, and how to build a simple AI flow. It would also speculate on the future of AI development frameworks.", imageUrl: 'https://cdn.sanity.io/images/0vv8moc6/medec/8022c91678b2731dffb6b564ec54ab428b93dc1e-5376x3584.jpg?fit=crop&auto=format', publishedAt: '2024-06-10', featured: true },
];

export const galleryImages: GalleryImage[] = [
  { id: 'g1', title: 'Team Collaboration', imageUrl: 'https://picsum.photos/seed/teamwork/400/600', category: 'Team Collaboration', featured: true },
  { id: 'g2', title: 'Office Environment', imageUrl: 'https://picsum.photos/seed/g2/600/400', category: 'Team Collaboration', featured: true },
  { id: 'g3', title: 'AI Conference Talk', imageUrl: 'https://picsum.photos/seed/g3/600/400', category: 'Events', featured: true },
  { id: 'g4', title: 'Data Insights', imageUrl: 'https://picsum.photos/seed/g4/600/400', category: 'Tech Solutions', featured: false },
  { id: 'g5', title: 'Robotics Lab', imageUrl: 'https://picsum.photos/seed/g5/400/600', category: 'Tech Solutions', featured: false },
  { id: 'g6', title: 'Pair Programming', imageUrl: 'https://picsum.photos/seed/g6/600/400', category: 'Team Collaboration', featured: false },
];

export const events: Event[] = [
  { id: 'e1', title: 'Webinar: AI for UK Businesses', date: '2025-10-15', location: 'Online', description: 'A free webinar covering practical AI applications for small and medium-sized businesses.', featured: true, imageUrl: 'https://picsum.photos/seed/e1/600/400' },
  { id: 'e2', title: 'AI Innovation Summit', date: '2025-11-20', location: 'Manchester, UK', description: "Join us at the premier event for AI professionals and enthusiasts. We'll be at booth #123.", featured: true, imageUrl: 'https://picsum.photos/seed/e2/600/400' },
  { id: 'e3', title: 'Tech Meetup: The Future of NLP', date: '2025-12-05', location: 'Edinburgh, UK', description: "Our lead data scientist will be giving a talk on the latest advancements in Natural Language Processing.", featured: false, imageUrl: 'https://picsum.photos/seed/e3/600/400' },
];

export const jobs: Job[] = [
    { id: 'j1', title: 'Senior AI Engineer', location: 'Remote', type: 'Full-time', description: 'Lead the development of cutting-edge AI models and solutions for our enterprise clients.' },
    { id: 'j2', title: 'Data Scientist', location: 'New York, NY', type: 'Full-time', description: 'Analyze large datasets to uncover insights, build predictive models, and drive business decisions.' },
    { id: 'j3', title: 'Frontend Developer (React/Next.js)', location: 'Remote', type: 'Contract', description: 'Join our team to build and maintain beautiful, performant user interfaces for our AI applications.' },
];

export const testimonials: Testimonial[] = [];
