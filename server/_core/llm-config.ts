/**
 * Flexible LLM Configuration
 * Supports: OpenAI, Groq, Anthropic, or any OpenAI-compatible API
 */

export type LLMProvider = "openai" | "groq" | "anthropic" | "custom";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * Get LLM configuration from settings store (UI) or fallback to environment variables
 */
export async function getLLMConfig(): Promise<LLMConfig> {
  // Try to load from settings store first (UI configuration)
  try {
    const { getLLMSettings } = await import("../settings-store");
    const settings = await getLLMSettings();
    
    if (settings && settings.apiKey) {
      console.log("[LLM] Using settings from UI:", settings.provider);
      return {
        provider: settings.provider,
        apiKey: settings.apiKey,
        baseURL: settings.baseURL,
        model: settings.model,
      };
    }
  } catch (error) {
    console.warn("[LLM] Could not load settings from store, falling back to env vars");
  }
  
  // Fallback to environment variables
  const provider = (process.env.LLM_PROVIDER || "openai") as LLMProvider;
  
  // Get API key based on provider
  let apiKey = "";
  let baseURL = "";
  let model = "";
  
  switch (provider) {
    case "openai":
      apiKey = process.env.OPENAI_API_KEY || "";
      baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      model = process.env.OPENAI_MODEL || "gpt-4o";
      break;
      
    case "groq":
      apiKey = process.env.GROQ_API_KEY || "";
      baseURL = "https://api.groq.com/openai/v1";
      model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";
      break;
      
    case "anthropic":
      apiKey = process.env.ANTHROPIC_API_KEY || "";
      baseURL = "https://api.anthropic.com/v1";
      model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
      break;
      
    case "custom":
      apiKey = process.env.CUSTOM_LLM_API_KEY || "";
      baseURL = process.env.CUSTOM_LLM_BASE_URL || "";
      model = process.env.CUSTOM_LLM_MODEL || "gpt-4";
      break;
  }
  
  if (!apiKey) {
    console.warn(`[LLM] No API key found for provider: ${provider}`);
  }
  
  console.log("[LLM] Using settings from environment variables:", provider);
  
  return {
    provider,
    apiKey,
    baseURL,
    model,
  };
}

/**
 * Check if LLM is configured
 */
export async function isLLMConfigured(): Promise<boolean> {
  const config = await getLLMConfig();
  return !!config.apiKey;
}
