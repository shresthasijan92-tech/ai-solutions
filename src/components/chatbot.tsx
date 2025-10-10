'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chatbot';
import { isFirebaseConfigured } from '@/firebase/config';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: 'Hello! I am an AI assistant for AISolutions Hub. How can I help you today?',
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const scrollableView = scrollAreaRef.current?.querySelector('div');
        if (scrollableView) {
          scrollableView.scrollTo({ top: scrollableView.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat({
        history: messages,
        message: input,
      });

      const modelMessage: Message = {
        role: 'model',
        content: response.response,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "I'm sorry, but I'm having trouble connecting. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFirebaseConfigured) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="w-80 md:w-96 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-headline text-primary">
                <Bot />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex gap-2 text-sm',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {message.role === 'model' && <Bot className="h-5 w-5 text-primary flex-shrink-0" />}
                        <div
                            className={cn(
                            'rounded-lg px-3 py-2 max-w-[85%]',
                            message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {message.content}
                        </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start gap-2 text-sm">
                            <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                            <div className="rounded-lg px-3 py-2 bg-muted">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
