'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/actions/seed';
import { Loader2, Database } from 'lucide-react';

export default function SeedingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    const result = await seedDatabase();
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold">Data Seeding</h1>
      <p className="text-muted-foreground mt-2">
        Populate or reset your Firestore database with the initial mock data.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Clicking this button will clear all existing data in your collections and replace it with the data from{' '}
            <code className="bg-muted px-1 py-0.5 rounded-sm font-mono text-sm">src/lib/mock-data.ts</code>. This is useful for development and testing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
