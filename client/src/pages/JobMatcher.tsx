import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, CheckCircle, XCircle, Download, Copy } from "lucide-react";

export default function JobMatcher() {
  const [, navigate] = useLocation();
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const [tailoredResume, setTailoredResume] = useState("");

  const { mutate: analyzeJob, isPending: analyzing } = trpc.jobMatcher.analyzeJob.useMutation({
    onSuccess: (data) => {
      setMatchResult(data);
      toast.success("Job analysis complete!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to analyze job");
    },
  });

  const { mutate: tailorResume, isPending: tailoring } = trpc.jobMatcher.tailorResume.useMutation({
    onSuccess: (data) => {
      setTailoredResume(data.tailoredResume);
      toast.success("Resume tailored successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to tailor resume");
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    analyzeJob({ jobDescription });
  };

  const handleTailorResume = () => {
    if (!matchResult) return;
    tailorResume({ jobDescription });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadResume = () => {
    const blob = new Blob([tailoredResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  const shouldApply = matchResult && matchResult.overallScore >= 0.8;

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
            JOB MATCHER
          </h1>
          <p style={{ color: "var(--neon-cyan)" }}>
            Paste a job description to get instant match analysis
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
          {/* Job Description Input */}
          <Card className="hud-container">
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--neon-cyan)",
                marginBottom: "1rem",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              PASTE JOB DESCRIPTION
            </h2>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              style={{
                minHeight: "200px",
                backgroundColor: "#1a1a2e",
                color: "var(--neon-cyan)",
                borderColor: "var(--neon-cyan)",
              }}
            />
            <Button
              className="btn-neon"
              onClick={handleAnalyze}
              disabled={analyzing || !jobDescription.trim()}
              style={{ marginTop: "1rem" }}
            >
              <Sparkles style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
              {analyzing ? "ANALYZING..." : "ANALYZE MATCH"}
            </Button>
          </Card>

          {/* Match Results */}
          {matchResult && (
            <>
              {/* Overall Recommendation */}
              <Card
                className="hud-container"
                style={{
                  borderColor: shouldApply ? "var(--neon-green)" : "var(--neon-pink)",
                  backgroundColor: shouldApply
                    ? "rgba(57, 255, 20, 0.05)"
                    : "rgba(255, 0, 110, 0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  {shouldApply ? (
                    <CheckCircle style={{ width: "3rem", height: "3rem", color: "var(--neon-green)" }} />
                  ) : (
                    <XCircle style={{ width: "3rem", height: "3rem", color: "var(--neon-pink)" }} />
                  )}
                  <div>
                    <h2
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: shouldApply ? "var(--neon-green)" : "var(--neon-pink)",
                        fontFamily: "Orbitron, sans-serif",
                      }}
                    >
                      {shouldApply ? "STRONG MATCH - APPLY NOW!" : "NOT RECOMMENDED"}
                    </h2>
                    <p style={{ fontSize: "1.25rem", color: "#d1d5db" }}>
                      Overall Match: {Math.round(matchResult.overallScore * 100)}%
                    </p>
                  </div>
                </div>
                {shouldApply && (
                  <Button
                    className="btn-neon"
                    onClick={handleTailorResume}
                    disabled={tailoring}
                    style={{ marginTop: "1rem" }}
                  >
                    <Sparkles style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                    {tailoring ? "TAILORING..." : "GENERATE TAILORED RESUME"}
                  </Button>
                )}
              </Card>

              {/* Detailed Breakdown */}
              <Card className="hud-container">
                <h2
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--neon-cyan)",
                    marginBottom: "1rem",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  MATCH BREAKDOWN
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Skills Match</div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {Math.round(matchResult.skillsMatch * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Experience Match</div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {Math.round(matchResult.experienceMatch * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Location Match</div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {Math.round(matchResult.locationMatch * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Title Match</div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {Math.round(matchResult.titleMatch * 100)}%
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "rgba(0, 245, 255, 0.05)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(0, 245, 255, 0.2)",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>Analysis:</strong> {matchResult.reasoning}
                </div>
                
                {/* Visa Sponsorship Section */}
                {matchResult.visaSponsorshipNote && (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: matchResult.visaSponsorship === "not-offered" 
                        ? "rgba(255, 0, 110, 0.1)" 
                        : matchResult.visaSponsorship === "offered"
                        ? "rgba(57, 255, 20, 0.1)"
                        : "rgba(255, 165, 0, 0.1)",
                      borderRadius: "0.5rem",
                      border: `1px solid ${
                        matchResult.visaSponsorship === "not-offered"
                          ? "var(--neon-pink)"
                          : matchResult.visaSponsorship === "offered"
                          ? "var(--neon-green)"
                          : "orange"
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <strong style={{ 
                        color: matchResult.visaSponsorship === "not-offered"
                          ? "var(--neon-pink)"
                          : matchResult.visaSponsorship === "offered"
                          ? "var(--neon-green)"
                          : "orange"
                      }}>
                        {matchResult.visaSponsorship === "not-offered" ? "⚠️ " : matchResult.visaSponsorship === "offered" ? "✅ " : "ℹ️ "}
                        Visa Sponsorship:
                      </strong>
                    </div>
                    <div style={{ color: "#d1d5db" }}>
                      {matchResult.visaSponsorshipNote}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Tailored Resume */}
          {tailoredResume && (
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                TAILORED RESUME
              </h2>
              <Textarea
                value={tailoredResume}
                readOnly
                style={{
                  minHeight: "400px",
                  backgroundColor: "#1a1a2e",
                  color: "var(--neon-cyan)",
                  borderColor: "var(--neon-cyan)",
                  fontFamily: "monospace",
                }}
              />
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Button
                  className="btn-neon"
                  onClick={() => copyToClipboard(tailoredResume)}
                >
                  <Copy style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  COPY TO CLIPBOARD
                </Button>
                <Button
                  className="btn-neon"
                  onClick={downloadResume}
                >
                  <Download style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  DOWNLOAD
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
