import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ExternalLink, Star, Briefcase, List, User, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  // For local development without OAuth, allow access
  const isDevelopment = import.meta.env.DEV;

  const { data: jobs, isLoading } = trpc.jobs.getRecent.useQuery();
  const { mutate: updateStatus } = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated!");
    },
  });

  const handleApply = (jobId: number, jobUrl: string) => {
    window.open(jobUrl, "_blank");
    updateStatus({ jobId, status: "applied" });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'var(--neon-cyan)' }} className="scanlines">
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(0, 245, 255, 0.3)', background: 'linear-gradient(to right, #000, rgba(128, 0, 128, 0.2), #000)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--neon-pink)', marginBottom: '0.5rem', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>
                JOB FEED COMMAND CENTER
              </h1>
              <p style={{ color: 'var(--neon-cyan)' }}>
                {jobs?.length || 0} opportunities discovered in the last 48 hours
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                className="btn-neon"
                onClick={() => navigate("/job-matcher")}
              >
                <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                JOB MATCHER
              </Button>
              <Button
                className="btn-neon"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                SETTINGS
              </Button>
              <Button
                className="btn-neon"
                onClick={() => navigate("/applications")}
              >
                <List style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                APPLICATIONS
              </Button>
              <Button
                className="btn-neon"
                onClick={() => navigate("/profile")}
              >
                <User style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                PROFILE
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', paddingBottom: '5rem' }}>
            <Spinner style={{ width: '2rem', height: '2rem', color: 'var(--neon-cyan)' }} />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="hud-container"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  borderColor: selectedJob === job.id ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                }}
                onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {/* Job Info */}
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/job/${job.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <Briefcase style={{ width: '1.25rem', height: '1.25rem', color: 'var(--neon-cyan)' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-cyan)', transition: 'color 0.3s' }}>
                        {job.title}
                      </h3>
                    </div>
                    <p style={{ color: '#d1d5db', marginBottom: '0.75rem' }}>{job.company}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Badge variant="outline" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                        {job.platform}
                      </Badge>
                      {job.location && (
                        <Badge variant="outline" style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}>
                          {job.location}
                        </Badge>
                      )}
                      {job.relevanceScore && (
                        <Badge style={{ backgroundColor: 'var(--neon-pink)', color: '#000', fontWeight: 'bold' }}>
                          Match: {Math.round(Number(job.relevanceScore) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Relevance Score & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    {job.relevanceScore && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star style={{ width: '1.25rem', height: '1.25rem', color: 'var(--neon-pink)', fill: 'var(--neon-pink)' }} />
                        <span style={{ color: 'var(--neon-pink)', fontWeight: 'bold' }}>
                          {Math.round(Number(job.relevanceScore) * 100)}%
                        </span>
                      </div>
                    )}
                    <Button
                      className="btn-neon"
                      style={{ fontSize: '0.875rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.id}`);
                      }}
                    >
                      VIEW DETAILS
                    </Button>
                    <Button
                      className="btn-neon"
                      style={{ fontSize: '0.875rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job.id, job.url);
                      }}
                    >
                      <ExternalLink style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      APPLY
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedJob === job.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 245, 255, 0.2)' }}>
                    <p style={{ color: '#d1d5db', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description || "No description available"}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--neon-cyan)', transition: 'color 0.3s', fontSize: '0.875rem', fontFamily: 'monospace', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--neon-pink)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neon-cyan)')}
                      >
                        View Full Posting →
                      </a>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="hud-container" style={{ textAlign: 'center', paddingTop: '5rem', paddingBottom: '5rem' }}>
            <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '1rem' }}>
              No jobs found in the last 48 hours
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Check back soon or update your profile preferences
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
