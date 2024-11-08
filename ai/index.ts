import { createOpenAI } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

// Create custom OpenAI client for OpenRouter
const openai = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL
});

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: openai(apiIdentifier as any),
    middleware: customMiddleware,
  });
};
