/**
 * @fileoverview This file initializes and configures the Genkit AI instance.
 * It sets up the Google AI plugin and specifies the default model.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
