import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, CheckCircle, XCircle, RefreshCw, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

type LLMProvider = "openai" | "groq" | "anthropic" | "custom";

const providerDefaults = {
  openai: {
    model: "gpt-4o",
    baseURL: "https://api.openai.com/v1",
    signupURL: "https://platform.openai.com/signup",
    docs: "https://platform.openai.com/docs",
    description: "Best quality, ~$0.01-0.02 per job analysis",
  },
  groq: {
    model: "llama-3.3-70b-versatile",
    baseURL: "https://api.groq.com/openai/v1",
    signupURL: "https://console.groq.com",
    docs: "https://console.groq.com/docs",
    description: "FREE tier (14,400 requests/day), very fast",
  },
  anthropic: {
    model: "claude-3-5-sonnet-20241022",
    baseURL: "https://api.anthropic.com/v1",
    signupURL: "https://console.anthropic.com",
    docs: "https://docs.anthropic.com",
    description: "Excellent reasoning, similar cost to OpenAI",
  },
  custom: {
    model: "llama3.1",
    baseURL: "http://localhost:11434/v1",
    signupURL: "",
    docs: "",
    description: "Use Ollama or any OpenAI-compatible API",
  },
} as const;

export default function Settings() {
  const [, navigate] = useLocation();
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const utils = trpc.useUtils();

  const { mutate: saveSettings, isPending: saving } = trpc.settings.saveLLM.useMutation({
    onSuccess: () => {
      toast.success("LLM settings saved successfully!");
      utils.settings.getAllLLM.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  const { mutate: switchProvider, isPending: switching } = trpc.settings.switchProvider.useMutation({
    onSuccess: (data) => {
      toast.success(`Switched to ${data.activeProvider.toUpperCase()}!`);
      utils.settings.getAllLLM.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to switch provider: ${error.message}`);
    },
  });

  const { mutate: testConnection, isPending: testing } = trpc.settings.testLLM.useMutation({
    onSuccess: () => {
      toast.success("✅ LLM connection successful!");
      setIsTesting(false);
    },
    onError: (error) => {
      toast.error(`❌ Connection failed: ${error.message}`);
      setIsTesting(false);
    },
  });

  const { data: allSettings } = trpc.settings.getAllLLM.useQuery();
  const { data: currentSettings } = trpc.settings.getLLM.useQuery();

  // Initial load - set to active provider (only once)
  useEffect(() => {
    if (allSettings && !isInitialized) {
      setProvider(allSettings.activeProvider);
      setIsInitialized(true);
    }
  }, [allSettings, isInitialized]);

  // Load settings when provider changes
  useEffect(() => {
    if (!isInitialized) return; // Wait for initialization
    
    if (allSettings && allSettings.providers[provider]) {
      // Load saved settings for this provider
      const savedConfig = allSettings.providers[provider];
      
      // Don't load masked API keys - keep field empty to indicate "already saved"
      if (savedConfig.apiKey && !savedConfig.apiKey.startsWith("***")) {
        setApiKey(savedConfig.apiKey);
      } else {
        setApiKey(""); // Empty means "use saved key"
      }
      
      setModel(savedConfig.model || providerDefaults[provider].model);
      setBaseURL(savedConfig.baseURL || providerDefaults[provider].baseURL || "");
    } else {
      // No saved config, use defaults
      const defaults = providerDefaults[provider];
      setApiKey("");
      setModel(defaults.model);
      setBaseURL(defaults.baseURL || "");
    }
  }, [provider, allSettings, isInitialized]);

  const handleSave = () => {
    saveSettings({
      provider,
      apiKey,
      model: model || undefined,
      baseURL: baseURL || undefined,
    });
  };

  const handleTest = () => {
    setIsTesting(true);
    testConnection();
  };

  const handleSwitchProvider = (newProvider: LLMProvider) => {
    switchProvider({ provider: newProvider });
  };

  const currentDefaults = providerDefaults[provider];
  const isProviderConfigured = (p: LLMProvider) => allSettings?.providers[p]?.isConfigured;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        color: "var(--neon-cyan)",
      }}
      className="scanlines"
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(0, 245, 255, 0.3)",
          background: "linear-gradient(to right, #000, rgba(128, 0, 128, 0.2), #000)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "1rem",
            paddingTop: "2rem",
            paddingBottom: "2rem",
          }}
        >
          <Button
            variant="outline"
            style={{
              marginBottom: "1rem",
              borderColor: "var(--neon-cyan)",
              color: "var(--neon-cyan)",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
            Back to Dashboard
          </Button>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "var(--neon-pink)",
              fontFamily: "Orbitron, sans-serif",
              textTransform: "uppercase",
            }}
          >
            LLM SETTINGS
          </h1>
          <p style={{ color: "var(--neon-cyan)" }}>
            Configure multiple AI providers and switch between them easily
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Configured Providers - Quick Switch */}
          {allSettings && Object.keys(allSettings.providers).length > 0 && (
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                CONFIGURED PROVIDERS
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {(Object.entries(allSettings.providers) as [LLMProvider, any][]).map(([providerKey, config]) => {
                  const isActive = allSettings.activeProvider === providerKey;
                  return (
                    <div
                      key={providerKey}
                      style={{
                        padding: "1rem",
                        backgroundColor: isActive ? "rgba(57, 255, 20, 0.1)" : "rgba(0, 245, 255, 0.05)",
                        borderRadius: "0.5rem",
                        border: `2px solid ${isActive ? "var(--neon-green)" : "rgba(0, 245, 255, 0.2)"}`,
                        cursor: isActive ? "default" : "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => !isActive && handleSwitchProvider(providerKey)}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <strong style={{ color: isActive ? "var(--neon-green)" : "var(--neon-cyan)", textTransform: "uppercase" }}>
                          {providerKey}
                        </strong>
                        {isActive && (
                          <Zap style={{ width: "1rem", height: "1rem", color: "var(--neon-green)" }} />
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                        Model: {config.model}
                      </div>
                      {isActive ? (
                        <div style={{ fontSize: "0.875rem", color: "var(--neon-green)", fontWeight: "bold" }}>
                          ✓ ACTIVE
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.875rem", color: "var(--neon-cyan)" }}>
                          Click to switch
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "1rem" }}>
                💡 Click on any provider to switch. Perfect for managing API budgets!
              </p>
            </Card>
          )}

          <div style={{ display: "grid", gap: "2rem", maxWidth: "48rem" }}>
            {/* Provider Selection */}
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                ADD/UPDATE PROVIDER
              </h2>
            <Select value={provider} onValueChange={(value) => setProvider(value as LLMProvider)}>
              <SelectTrigger
                style={{
                  backgroundColor: "#1a1a2e",
                  borderColor: "var(--neon-cyan)",
                  color: "var(--neon-cyan)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="groq">Groq (FREE - Llama 3.1)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="custom">Custom (Ollama/LocalAI)</SelectItem>
              </SelectContent>
            </Select>

            {/* Provider Info */}
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "rgba(0, 245, 255, 0.05)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(0, 245, 255, 0.2)",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                <strong>{provider.toUpperCase()}</strong> - {currentDefaults.description}
              </div>
              {currentDefaults.signupURL && (
                <a
                  href={currentDefaults.signupURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--neon-pink)",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                    display: "inline-block",
                  }}
                >
                  Sign up for API key →
                </a>
              )}
            </div>
          </Card>

          {/* API Key */}
          <Card className="hud-container">
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--neon-cyan)",
                marginBottom: "1rem",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              API KEY
            </h2>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                isProviderConfigured(provider)
                  ? "API key already saved (leave empty to keep existing)"
                  : `Enter your ${provider.toUpperCase()} API key`
              }
              style={{
                backgroundColor: "#1a1a2e",
                color: "var(--neon-cyan)",
                borderColor: "var(--neon-cyan)",
              }}
            />
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              {isProviderConfigured(provider)
                ? "✓ API key is saved. Enter a new key only if you want to update it."
                : "Your API key is stored securely and never shared"}
            </p>
          </Card>

          {/* Advanced Settings */}
          <Card className="hud-container">
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--neon-cyan)",
                marginBottom: "1rem",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              ADVANCED SETTINGS
            </h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "var(--neon-cyan)",
                    fontSize: "0.875rem",
                  }}
                >
                  Model (optional)
                </label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={currentDefaults.model}
                  style={{
                    backgroundColor: "#1a1a2e",
                    color: "var(--neon-cyan)",
                    borderColor: "var(--neon-cyan)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "var(--neon-cyan)",
                    fontSize: "0.875rem",
                  }}
                >
                  Base URL (optional)
                </label>
                <Input
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder={currentDefaults.baseURL}
                  style={{
                    backgroundColor: "#1a1a2e",
                    color: "var(--neon-cyan)",
                    borderColor: "var(--neon-cyan)",
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Button
              className="btn-neon"
              onClick={handleTest}
              disabled={!apiKey || testing}
              style={{ backgroundColor: "#666", borderColor: "#666" }}
            >
              {testing ? "TESTING..." : "TEST CONNECTION"}
            </Button>
            <Button
              className="btn-neon"
              onClick={handleSave}
              disabled={(!apiKey && !isProviderConfigured(provider)) || saving}
            >
              <Save style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
              {saving ? "SAVING..." : isProviderConfigured(provider) ? "UPDATE" : "SAVE & ACTIVATE"}
            </Button>
          </div>

          {/* Current Active Provider Status */}
          {allSettings?.activeProvider && (
            <Card
              className="hud-container"
              style={{
                borderColor: "var(--neon-green)",
                backgroundColor: "rgba(57, 255, 20, 0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Zap style={{ width: "1.5rem", height: "1.5rem", color: "var(--neon-green)" }} />
                <div>
                  <div style={{ fontWeight: "bold", color: "var(--neon-green)" }}>
                    ACTIVE PROVIDER: {allSettings.activeProvider.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                    Model: {allSettings.providers[allSettings.activeProvider]?.model}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
