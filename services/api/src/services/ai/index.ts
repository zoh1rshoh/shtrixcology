import type { AIProvider } from './provider.js';
import { GeminiProvider } from './gemini.js';
import { env } from '../../env.js';

let instance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (instance) return instance;

  switch (env.AI_PROVIDER) {
    case 'gemini':
      instance = new GeminiProvider();
      break;
    default:
      throw new Error(`Unknown AI provider: ${env.AI_PROVIDER}`);
  }

  return instance;
}