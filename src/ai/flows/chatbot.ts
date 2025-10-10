'use server';

/**
 * @fileOverview A real-time AI chatbot flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Part } from '@genkit-ai/googleai';

// Define the schema for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Define the input schema for the chat flow.
const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the output schema for the chat flow.
const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const { history, message } = input;

    // The Gemini API requires that the history alternates between user and model roles.
    // This removes the first message if it's a model message, which can happen with our initial "Hello" message.
    const filteredHistory = history.length > 0 && history[0].role !== 'user'
        ? history.slice(1)
        : history;

    const geminiHistory = filteredHistory.map(
      (msg): Part => ({
        role: msg.role,
        text: msg.content,
      })
    );

    const { text } = await ai.generate({
      system: `You are a friendly and helpful assistant for the AISolutions Hub website.
Your goal is to answer user questions about the company, its services, projects, and blog.
Be concise and helpful.
If you don't know the answer, say that you don't have that information.`,
      prompt: message,
      history: geminiHistory,
    });

    return { response: text };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
