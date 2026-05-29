import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase,
  ExternalLink,
  Star,
  MapPin,
  DollarSign,
  FileText,
  Mail,
  Linkedin,
  Phone,
  Copy,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function JobDetails() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/job/:id");
  const jobId = params?.id ? parseInt(params.id) : null;

  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");

  // For local development without OAuth, allow access
  const isDevelopment = import.meta.env.DEV;

  if (!jobId) {
    navigate("/dashboard");
    return null;
  }

  const { data: job, isLoading: jobLoading } = trpc.jobs.getById.useQuery({
    jobId,
  });
  const { data: recruiter } = trpc.recruiters.getByJobId.useQuery({ jobId });
  const { data: coverLetter } = trpc.coverLetters.get.useQuery({ jobId });

  const { mutate: generateCoverLetter, isPending: generatingCoverLetter } =
    trpc.coverLetters.generate.useMutation({
      onSuccess: (data) => {
        setGeneratedCoverLetter(data.content);
        setShowCoverLetter(true);
        toast.success("Cover letter generated!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate cover letter");
      },
    });

  const { mutate: analyzeMatch, isPending: analyzingMatch } =
    trpc.jobs.analyzeMatch.useMutation({
      onSuccess: (data) => {
        toast.success(`Match score: ${Math.round(data.score * 100)}%`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to analyze match");
      },
    });

  const { mutate: extractRecruiter, isPending: extractingRecruiter } =
    trpc.jobs.extractRecruiter.useMutation({
      onSuccess: () => {
        toast.success("Recruiter info extracted!");
      },
      onError: () => {
        toast.error("Failed to extract recruiter info");
      },
    });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (jobLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner
          style={{ width: "2rem", height: "2rem", color: "var(--neon-cyan)" }}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--neon-cyan)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Job not found
          </h2>
          <Button className="btn-neon" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const matchBreakdown = job.matchBreakdown as any;

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
          background:
            "linear-gradient(to right, #000, rgba(128, 0, 128, 0.2), #000)",
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
            ← Back to Dashboard
          </Button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <Briefcase
              style={{
                width: "2rem",
                height: "2rem",
                color: "var(--neon-cyan)",
              }}
            />
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                color: "var(--neon-pink)",
                fontFamily: "Orbitron, sans-serif",
                textTransform: "uppercase",
              }}
            >
              {job.title}
            </h1>
          </div>
          <p style={{ fontSize: "1.25rem", color: "var(--neon-cyan)" }}>
            {job.company}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Job Overview */}
          <Card className="hud-container">
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--neon-cyan)",
                marginBottom: "1rem",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              JOB OVERVIEW
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {job.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "var(--neon-purple)",
                    }}
                  />
                  <span>{job.location}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: "var(--neon-cyan)",
                    color: "var(--neon-cyan)",
                  }}
                >
                  {job.platform}
                </Badge>
              </div>
              {job.relevanceScore && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Star
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "var(--neon-pink)",
                      fill: "var(--neon-pink)",
                    }}
                  />
                  <span style={{ color: "var(--neon-pink)", fontWeight: "bold" }}>
                    {Math.round(Number(job.relevanceScore) * 100)}% Match
                  </span>
                </div>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DollarSign
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "var(--neon-green)",
                    }}
                  />
                  <span>
                    {job.salaryMin && `$${Number(job.salaryMin).toLocaleString()}`}
                    {job.salaryMin && job.salaryMax && " - "}
                    {job.salaryMax && `$${Number(job.salaryMax).toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button
                className="btn-neon"
                onClick={() => window.open(job.url, "_blank")}
              >
                <ExternalLink
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                VIEW POSTING
              </Button>
              <Button
                className="btn-neon"
                onClick={() => generateCoverLetter({ jobId })}
                disabled={generatingCoverLetter}
              >
                <Sparkles
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                {generatingCoverLetter ? "GENERATING..." : "GENERATE COVER LETTER"}
              </Button>
              {!job.relevanceScore && (
                <Button
                  className="btn-neon"
                  onClick={() => analyzeMatch({ jobId })}
                  disabled={analyzingMatch}
                >
                  <TrendingUp
                    style={{
                      width: "1rem",
                      height: "1rem",
                      marginRight: "0.5rem",
                    }}
                  />
                  {analyzingMatch ? "ANALYZING..." : "ANALYZE MATCH"}
                </Button>
              )}
              {!recruiter && (
                <Button
                  className="btn-neon"
                  onClick={() => extractRecruiter({ jobId })}
                  disabled={extractingRecruiter}
                >
                  {extractingRecruiter ? "EXTRACTING..." : "EXTRACT RECRUITER"}
                </Button>
              )}
            </div>
          </Card>

          {/* Match Breakdown */}
          {matchBreakdown && (
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                MATCH ANALYSIS
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    Skills Match
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "var(--neon-cyan)",
                    }}
                  >
                    {Math.round(matchBreakdown.skillsMatch * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    Experience Match
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "var(--neon-cyan)",
                    }}
                  >
                    {Math.round(matchBreakdown.experienceMatch * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    Location Match
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "var(--neon-cyan)",
                    }}
                  >
                    {Math.round(matchBreakdown.locationMatch * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    Title Match
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "var(--neon-cyan)",
                    }}
                  >
                    {Math.round(matchBreakdown.titleMatch * 100)}%
                  </div>
                </div>
              </div>
              <p style={{ color: "#d1d5db" }}>{matchBreakdown.reasoning}</p>
            </Card>
          )}

          {/* Job Description */}
          <Card className="hud-container">
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--neon-cyan)",
                marginBottom: "1rem",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              DESCRIPTION
            </h2>
            <p style={{ color: "#d1d5db", whiteSpace: "pre-wrap" }}>
              {job.description || "No description available"}
            </p>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                REQUIREMENTS
              </h2>
              <p style={{ color: "#d1d5db", whiteSpace: "pre-wrap" }}>
                {job.requirements}
              </p>
            </Card>
          )}

          {/* Recruiter Info */}
          {recruiter && (
            <Card className="hud-container">
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-cyan)",
                  marginBottom: "1rem",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                RECRUITER CONTACT
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {recruiter.name && (
                  <div>
                    <strong>Name:</strong> {recruiter.name}
                    {recruiter.title && ` - ${recruiter.title}`}
                  </div>
                )}
                {recruiter.email && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Mail
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: "var(--neon-cyan)",
                      }}
                    />
                    <a
                      href={`mailto:${recruiter.email}`}
                      style={{ color: "var(--neon-cyan)" }}
                    >
                      {recruiter.email}
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(recruiter.email!, "Email")
                      }
                    >
                      <Copy style={{ width: "0.875rem", height: "0.875rem" }} />
                    </Button>
                  </div>
                )}
                {recruiter.linkedinUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Linkedin
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: "var(--neon-cyan)",
                      }}
                    />
                    <a
                      href={recruiter.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--neon-cyan)" }}
                    >
                      LinkedIn Profile
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(recruiter.linkedinUrl!, "LinkedIn URL")
                      }
                    >
                      <Copy style={{ width: "0.875rem", height: "0.875rem" }} />
                    </Button>
                  </div>
                )}
                {recruiter.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Phone
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: "var(--neon-cyan)",
                      }}
                    />
                    <span>{recruiter.phone}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(recruiter.phone!, "Phone")
                      }
                    >
                      <Copy style={{ width: "0.875rem", height: "0.875rem" }} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cover Letter Dialog */}
      <Dialog open={showCoverLetter} onOpenChange={setShowCoverLetter}>
        <DialogContent
          style={{
            backgroundColor: "#1a1a2e",
            borderColor: "var(--neon-cyan)",
            maxWidth: "800px",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--neon-pink)",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              GENERATED COVER LETTER
            </DialogTitle>
            <DialogDescription style={{ color: "#9ca3af" }}>
              Review and copy your personalized cover letter
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={generatedCoverLetter || coverLetter?.content || ""}
            readOnly
            style={{
              minHeight: "400px",
              backgroundColor: "#0a0a0f",
              color: "var(--neon-cyan)",
              borderColor: "var(--neon-cyan)",
            }}
          />
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Button
              className="btn-neon"
              onClick={() =>
                copyToClipboard(
                  generatedCoverLetter || coverLetter?.content || "",
                  "Cover letter"
                )
              }
            >
              <Copy
                style={{
                  width: "1rem",
                  height: "1rem",
                  marginRight: "0.5rem",
                }}
              />
              COPY TO CLIPBOARD
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
