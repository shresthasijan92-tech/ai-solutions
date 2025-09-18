'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the best representation and layout of featured content on the homepage.
 *
 * - `getHomepageContentSuggestions` - An async function that takes featured content types as input and returns AI-powered suggestions for their representation on the homepage.
 * - `HomepageContentSuggestionsInput` - The input type for the `getHomepageContentSuggestions` function, defining the featured content types.
 * - `HomepageContentSuggestionsOutput` - The output type for the `getHomepageContentSuggestions` function, providing suggestions for homepage representation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomepageContentSuggestionsInputSchema = z.object({
  featuredContent: z
    .array(
      z.enum(['Services', 'Projects', 'Blog', 'Gallery', 'Events'])
    )
    .describe('An array of content types featured on the homepage.'),
});
export type HomepageContentSuggestionsInput = z.infer<
  typeof HomepageContentSuggestionsInputSchema
>;

const HomepageContentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-powered suggestions for the best representation and layout of the featured content on the homepage, optimizing for user engagement.'
    ),
});
export type HomepageContentSuggestionsOutput = z.infer<
  typeof HomepageContentSuggestionsOutputSchema
>;

export async function getHomepageContentSuggestions(
  input: HomepageContentSuggestionsInput
): Promise<HomepageContentSuggestionsOutput> {
  return homepageContentSuggestionsFlow(input);
}

const homepageContentSuggestionsPrompt = ai.definePrompt({
  name: 'homepageContentSuggestionsPrompt',
  input: {
    schema: HomepageContentSuggestionsInputSchema,
  },
  output: {
    schema: HomepageContentSuggestionsOutputSchema,
  },
  prompt: `You are an AI assistant specializing in user interface and user experience design.

You are helping an administrator of a website called AI Solutions to design the homepage.

The administrator has selected the following content to be featured on the homepage: {{featuredContent}}.

Based on this selection, suggest the best representation and layout for this content on the homepage, optimizing for user engagement. Consider factors such as visual appeal, information hierarchy, and ease of navigation.

Provide concrete suggestions, taking into account the brand of AI Solutions which can be described as:
* Professional
* Innovative
* Client-focused

Output a single paragraph with a bulleted list of suggestions.
`,
});

const homepageContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'homepageContentSuggestionsFlow',
    inputSchema: HomepageContentSuggestionsInputSchema,
    outputSchema: HomepageContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await homepageContentSuggestionsPrompt(input);
    return output!;
  }
);
