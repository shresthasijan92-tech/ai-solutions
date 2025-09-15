'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const words = ['Innovate', 'Automate', 'Accelerate'];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (isDeleting) {
      if (subIndex === 0) {
        setIsDeleting(false);
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
        return;
      }
      const timer = setTimeout(() => {
        setSubIndex((prevSubIndex) => prevSubIndex - 1);
        setText(words[index].substring(0, subIndex - 1));
      }, 100);
      return () => clearTimeout(timer);
    }

    if (subIndex === words[index].length) {
      const timer = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setSubIndex((prevSubIndex) => prevSubIndex + 1);
      setText(words[index].substring(0, subIndex + 1));
    }, 150);
    return () => clearTimeout(timer);
  }, [subIndex, index, isDeleting]);

  return (
    <section className="relative bg-card py-20 md:py-32">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)',
                opacity: 0.05,
            }}
        ></div>
      <div className="container relative text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          We Help You{' '}
          <span className="inline-block min-w-[200px] text-primary">
            {text}
            <span className="animate-ping">|</span>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Leverage the power of artificial intelligence to solve complex business problems, drive growth, and stay ahead of the curve.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/services">Our Services</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
