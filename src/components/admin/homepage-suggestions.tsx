'use client';

import { useState } from 'react';
import {
  getHomepageContentSuggestions,
  type HomepageContentSuggestionsInput,
} from '@/ai/flows/homepage-content-suggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';

const contentTypes = ['Services', 'Projects', 'Blog', 'Gallery', 'Events'] as const;

export function HomepageSuggestions() {
  const [selectedContent, setSelectedContent] = useState<
    HomepageContentSuggestionsInput['featuredContent']
  >([]);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (contentType: (typeof contentTypes)[number]) => {
    setSelectedContent((prev) =>
      prev.includes(contentType)
        ? prev.filter((item) => item !== contentType)
        : [...prev, contentType]
    );
  };

  const fetchSuggestion = async () => {
    if (selectedContent.length === 0) {
      setError('Please select at least one content type.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const result = await getHomepageContentSuggestions({
        featuredContent: selectedContent,
      });
      setSuggestion(result.suggestions);
    } catch (err) {
      setError('Failed to get suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Wand2 className="h-5 w-5" />
            AI Homepage Suggestions
        </CardTitle>
        <CardDescription>
          Select the content types you want to feature on the homepage, and our AI will suggest an optimal layout for user engagement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {contentTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  onCheckedChange={() => handleCheckboxChange(type)}
                />
                <Label htmlFor={type} className="text-sm font-medium">
                  {type}
                </Label>
              </div>
            ))}
          </div>
          <Button onClick={fetchSuggestion} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Suggestions
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {suggestion && (
            <div className="mt-4 rounded-lg border bg-muted p-4">
              <p className="text-sm text-foreground">{suggestion}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
