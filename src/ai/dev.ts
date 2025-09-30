'use server';
/**
 * @fileOverview This file imports and registers all Genkit flows for development.
 * It is used by the `genkit:dev` and `genkit:watch` scripts.
 */

import {config} from 'dotenv';
config();

// Import all flow files here
import '@/ai/flows/homepage-content-suggestions';
