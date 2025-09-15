import { getJobs } from '@/lib/jobs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase } from 'lucide-react';

export default async function CareersPage() {
  const jobs = await getJobs();

  return (
    <div className="container py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-headline font-bold mb-4">Join Our Team</h1>
        <p className="text-lg text-muted-foreground">
            We&apos;re looking for passionate, innovative individuals to help us push the boundaries of AI. Explore our open positions below.
        </p>
      </div>
      
      <div className="mt-12 max-w-4xl mx-auto space-y-6">
        {jobs.length === 0 ? (
          <p className="text-center">No open positions at the moment. Please check back later!</p>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                    <div className="flex items-center gap-4 text-sm mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                        <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.type}</span>
                    </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
              <CardFooter>
                 <Button asChild>
                    <a href={`mailto:careers@aisolutionshub.com?subject=Application for ${job.title}`}>Apply Now</a>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
