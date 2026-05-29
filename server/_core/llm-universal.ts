/**
 * Universal LLM Client
 * Works with OpenAI, Groq, Anthropic, or any OpenAI-compatible API
 */

import OpenAI from "openai";
import { getLLMConfig, isLLMConfigured } from "./llm-config";

let _client: OpenAI | null = null;
let _currentConfig: any = null;

/**
 * Reset the LLM client (force reload on next use)
 */
export function resetLLMClient() {
  console.log("[LLM] Resetting client");
  _client = null;
  _currentConfig = null;
}

/**
 * Get or create LLM client
 */
async function getClient(): Promise<OpenAI> {
  const config = await getLLMConfig();
  
  // Reset client if config changed
  if (_client && _currentConfig && _currentConfig.apiKey !== config.apiKey) {
    console.log("[LLM] Config changed, resetting client");
    resetLLMClient();
  }
  
  if (!_client) {
    if (!config.apiKey) {
      throw new Error(
        `LLM API key not configured. Please configure in Settings page or set environment variables.`
      );
    }
    
    _client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    
    _currentConfig = config;
    
    console.log(`[LLM] Initialized ${config.provider} client with model: ${config.model}, baseURL: ${config.baseURL}`);
    console.log(`[LLM] API key starts with: ${config.apiKey.substring(0, 10)}...`);
  }
  
  return _client;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  messages: Message[];
  response_format?: {
    type: "json_object" | "json_schema";
    json_schema?: {
      name: string;
      strict?: boolean;
      schema: Record<string, any>;
    };
  };
  temperature?: number;
  max_tokens?: number;
}

/**
 * Universal LLM invocation
 * Works with any OpenAI-compatible API
 */
export async function invokeLLM(options: LLMOptions) {
  const isConfigured = await isLLMConfigured();
  if (!isConfigured) {
    throw new Error(
      "LLM not configured. Please configure in Settings page or set environment variables."
    );
  }
  
  const client = await getClient();
  const config = await getLLMConfig();
  
  try {
    console.log(`[LLM] Invoking ${config.provider} with model: ${config.model}`);
    
    // Groq doesn't support json_schema with strict mode, use json_object instead
    let responseFormat = options.response_format;
    if (config.provider === "groq" && responseFormat?.type === "json_schema") {
      console.log("[LLM] Converting json_schema to json_object for Groq compatibility");
      responseFormat = { type: "json_object" };
    }
    
    const response = await client.chat.completions.create({
      model: config.model!,
      messages: options.messages,
      response_format: responseFormat as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
    });
    
    return response;
  } catch (error: any) {
    console.error("[LLM] Error:", error.message);
    throw new Error(`LLM API error: ${error.status || error.code || 'unknown'} ${error.message}`);
  }
}
