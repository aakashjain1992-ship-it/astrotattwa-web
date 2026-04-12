/**
 * AI provider configuration for horoscope generation.
 * Change `provider` to switch between Anthropic and OpenAI.
 * Change the model strings to use different models.
 */
export const AI_CONFIG = {
  provider: 'anthropic' as 'anthropic' | 'openai',
  // Per-type model selection — daily uses Haiku (runs every day), weekly/monthly use Sonnet (better quality, less frequent)
  anthropicModels: {
    daily:   'claude-haiku-4-5-20251001',  // ~$0.05/run  — 30×/month
    weekly:  'claude-sonnet-4-6',           // ~$0.32/run  — 4×/month
    monthly: 'claude-sonnet-4-6',           // ~$0.32/run  — 1×/month
  } as Record<string, string>,
  openaiModel: 'gpt-4o-mini',
  temperature: 0.8,
  maxTokens: 8192,
} as const

export type AiProvider = typeof AI_CONFIG.provider
