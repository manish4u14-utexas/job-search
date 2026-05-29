/**
 * Simple file-based settings storage
 * Stores LLM configuration persistently
 * Supports multiple LLM providers with easy switching
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const SETTINGS_DIR = join(process.cwd(), ".settings");
const SETTINGS_FILE = join(SETTINGS_DIR, "llm-config.json");

export interface LLMProviderConfig {
  provider: "openai" | "groq" | "anthropic" | "custom";
  apiKey: string;
  model?: string;
  baseURL?: string;
  isConfigured: boolean;
}

export interface MultiLLMSettings {
  activeProvider: "openai" | "groq" | "anthropic" | "custom";
  providers: {
    openai?: LLMProviderConfig;
    groq?: LLMProviderConfig;
    anthropic?: LLMProviderConfig;
    custom?: LLMProviderConfig;
  };
}

// Legacy interface for backward compatibility
export interface LLMSettings {
  provider: "openai" | "groq" | "anthropic" | "custom";
  apiKey: string;
  model?: string;
  baseURL?: string;
  isConfigured: boolean;
}

/**
 * Ensure settings directory exists
 */
async function ensureSettingsDir() {
  if (!existsSync(SETTINGS_DIR)) {
    await mkdir(SETTINGS_DIR, { recursive: true });
  }
}

/**
 * Get all LLM settings (multi-provider)
 */
export async function getAllLLMSettings(): Promise<MultiLLMSettings | null> {
  try {
    await ensureSettingsDir();
    if (!existsSync(SETTINGS_FILE)) {
      return null;
    }
    const data = await readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    
    // Check if it's the new multi-provider format
    if (parsed.activeProvider && parsed.providers) {
      return parsed as MultiLLMSettings;
    }
    
    // Migrate from old single-provider format
    if (parsed.provider && parsed.apiKey) {
      return {
        activeProvider: parsed.provider,
        providers: {
          [parsed.provider]: parsed as LLMProviderConfig
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error("[Settings] Error reading LLM settings:", error);
    return null;
  }
}

/**
 * Get LLM settings (returns active provider config for backward compatibility)
 */
export async function getLLMSettings(): Promise<LLMSettings | null> {
  try {
    const allSettings = await getAllLLMSettings();
    if (!allSettings) return null;
    
    const activeConfig = allSettings.providers[allSettings.activeProvider];
    return activeConfig || null;
  } catch (error) {
    console.error("[Settings] Error reading LLM settings:", error);
    return null;
  }
}

/**
 * Save LLM provider configuration
 */
export async function saveLLMProviderConfig(
  provider: "openai" | "groq" | "anthropic" | "custom",
  config: Omit<LLMProviderConfig, "provider" | "isConfigured">
): Promise<void> {
  try {
    await ensureSettingsDir();
    
    // Get existing settings or create new
    let allSettings = await getAllLLMSettings();
    if (!allSettings) {
      allSettings = {
        activeProvider: provider,
        providers: {}
      };
    }
    
    // Add default models and baseURLs if not provided
    const defaults: Record<string, { model: string; baseURL?: string }> = {
      openai: { model: "gpt-4o", baseURL: "https://api.openai.com/v1" },
      groq: { model: "llama-3.3-70b-versatile", baseURL: "https://api.groq.com/openai/v1" },
      anthropic: { model: "claude-3-5-sonnet-20241022", baseURL: "https://api.anthropic.com/v1" },
      custom: { model: "gpt-4" },
    };
    
    const providerDefaults = defaults[provider];
    
    // If API key is empty or masked, keep existing one
    let apiKey = config.apiKey;
    if (!apiKey || apiKey.startsWith("***")) {
      const existingConfig = allSettings.providers[provider];
      if (existingConfig && existingConfig.apiKey) {
        apiKey = existingConfig.apiKey;
        console.log(`[Settings] Keeping existing API key for ${provider}`);
      } else {
        throw new Error("API key is required for new provider configuration");
      }
    }
    
    const fullConfig: LLMProviderConfig = {
      provider,
      apiKey,
      model: config.model || providerDefaults.model,
      baseURL: config.baseURL || providerDefaults.baseURL,
      isConfigured: true,
    };
    
    // Update provider config
    allSettings.providers[provider] = fullConfig;
    
    // Save to file
    await writeFile(SETTINGS_FILE, JSON.stringify(allSettings, null, 2), "utf-8");
    console.log(`[Settings] ${provider} configuration saved successfully`);
    
    // If this is the active provider, update env vars immediately
    if (allSettings.activeProvider === provider) {
      await updateEnvVars(fullConfig);
      
      // Reset LLM client
      const { resetLLMClient } = await import("./_core/llm-universal");
      resetLLMClient();
      console.log(`[Settings] Active provider updated, client reset`);
    }
  } catch (error) {
    console.error("[Settings] Error saving LLM provider config:", error);
    throw new Error("Failed to save LLM provider configuration");
  }
}

/**
 * Switch active LLM provider
 */
export async function switchActiveProvider(
  provider: "openai" | "groq" | "anthropic" | "custom"
): Promise<void> {
  try {
    await ensureSettingsDir();
    
    const allSettings = await getAllLLMSettings();
    if (!allSettings) {
      throw new Error("No LLM settings found. Please configure a provider first.");
    }
    
    if (!allSettings.providers[provider]) {
      throw new Error(`${provider} is not configured. Please configure it first.`);
    }
    
    // Update active provider
    allSettings.activeProvider = provider;
    
    // Save to file
    await writeFile(SETTINGS_FILE, JSON.stringify(allSettings, null, 2), "utf-8");
    console.log(`[Settings] Switched active provider to: ${provider}`);
    
    // Update environment variables
    await updateEnvVars(allSettings.providers[provider]!);
    
    // Reset LLM client
    const { resetLLMClient } = await import("./_core/llm-universal");
    resetLLMClient();
  } catch (error) {
    console.error("[Settings] Error switching provider:", error);
    throw error;
  }
}

/**
 * Update environment variables for active provider
 */
async function updateEnvVars(config: LLMProviderConfig): Promise<void> {
  // Clear all LLM-related env vars first
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.GROQ_API_KEY;
  delete process.env.GROQ_MODEL;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_MODEL;
  delete process.env.CUSTOM_LLM_API_KEY;
  delete process.env.CUSTOM_LLM_MODEL;
  delete process.env.CUSTOM_LLM_BASE_URL;
  
  // Set provider
  process.env.LLM_PROVIDER = config.provider;
  
  console.log(`[Settings] Setting env vars for ${config.provider}:`, {
    apiKeyPrefix: config.apiKey.substring(0, 10) + '...',
    model: config.model,
    baseURL: config.baseURL
  });
  
  switch (config.provider) {
    case "openai":
      process.env.OPENAI_API_KEY = config.apiKey;
      if (config.model) process.env.OPENAI_MODEL = config.model;
      if (config.baseURL) process.env.OPENAI_BASE_URL = config.baseURL;
      break;
    case "groq":
      process.env.GROQ_API_KEY = config.apiKey;
      if (config.model) process.env.GROQ_MODEL = config.model;
      if (config.baseURL) process.env.GROQ_BASE_URL = config.baseURL;
      break;
    case "anthropic":
      process.env.ANTHROPIC_API_KEY = config.apiKey;
      if (config.model) process.env.ANTHROPIC_MODEL = config.model;
      if (config.baseURL) process.env.ANTHROPIC_BASE_URL = config.baseURL;
      break;
    case "custom":
      process.env.CUSTOM_LLM_API_KEY = config.apiKey;
      if (config.model) process.env.CUSTOM_LLM_MODEL = config.model;
      if (config.baseURL) process.env.CUSTOM_LLM_BASE_URL = config.baseURL;
      break;
  }
  
  console.log(`[Settings] Environment variables updated for ${config.provider}`);
}

/**
 * Save LLM settings (backward compatibility - saves and sets as active)
 */
export async function saveLLMSettings(settings: Omit<LLMSettings, "isConfigured">): Promise<void> {
  try {
    // Save provider config
    await saveLLMProviderConfig(settings.provider, {
      apiKey: settings.apiKey,
      model: settings.model,
      baseURL: settings.baseURL
    });
    
    // Switch to this provider
    await switchActiveProvider(settings.provider);
  } catch (error) {
    console.error("[Settings] Error saving LLM settings:", error);
    throw new Error("Failed to save LLM settings");
  }
}

/**
 * Load settings on startup
 */
export async function loadLLMSettingsOnStartup() {
  const settings = await getLLMSettings();
  if (settings) {
    console.log("[Settings] Loading saved LLM configuration:", settings.provider);
    await saveLLMSettings(settings); // This updates env vars
  }
}
