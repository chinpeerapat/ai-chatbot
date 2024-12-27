// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    apiIdentifier: process.env.MODEL_GPT_4O_MINI || 'openai/gpt-4o-mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    apiIdentifier: process.env.MODEL_GPT_4O || 'openai/gpt-4o',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'gpt-4o-canvas',
    label: 'GPT-4o with Canvas',
    apiIdentifier: process.env.MODEL_GPT_4O_CANVAS || 'openai/gpt-4o',
    description: 'Collaborate with writing',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';
