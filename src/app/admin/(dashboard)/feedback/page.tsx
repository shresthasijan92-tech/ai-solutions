import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminFeedbackPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold">Manage Feedback</h1>
      <p className="text-muted-foreground mt-2">Review, approve, or reject user-submitted feedback.</p>

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
            <p>A list of pending feedback submissions will be displayed here.</p>
        </TabsContent>
        <TabsContent value="reviewed" className="mt-4">
            <p>A list of approved and rejected feedback submissions will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
