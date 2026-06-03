import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Star, Briefcase, List, User, Settings as SettingsIcon, Sparkles, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [activeRegion, setActiveRegion] = useState<"usa" | "india" | "middle-east">("usa");

  // For local development without OAuth, allow access
  const isDevelopment = import.meta.env.DEV;

  // Fetch jobs for each region
  const { data: usaJobs, isLoading: usaLoading, refetch: refetchUsa } = trpc.jobFeed.fetch.useQuery(
    { source: "indeed", region: "usa", hoursOld: 72, limit: 30 },
    { enabled: activeRegion === "usa" }
  );
  
  const { data: indiaJobs, isLoading: indiaLoading, refetch: refetchIndia } = trpc.jobFeed.fetch.useQuery(
    { source: "indeed", region: "india", hoursOld: 72, limit: 30 },
    { enabled: activeRegion === "india" }
  );
  
  const { data: middleEastJobs, isLoading: middleEastLoading, refetch: refetchMiddleEast } = trpc.jobFeed.fetch.useQuery(
    { source: "indeed", region: "middle-east", hoursOld: 72, limit: 30 },
    { enabled: activeRegion === "middle-east" }
  );

  const { mutate: updateStatus } = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated!");
    },
  });

  const handleApply = (jobId: string, jobUrl: string) => {
    window.open(jobUrl, "_blank");
    toast.success("Application link opened!");
  };

  const handleRefresh = () => {
    if (activeRegion === "usa") refetchUsa();
    else if (activeRegion === "india") refetchIndia();
    else if (activeRegion === "middle-east") refetchMiddleEast();
    toast.success("Refreshing jobs...");
  };

  // Helper to get current region's jobs and loading state
  const getCurrentRegionData = () => {
    if (activeRegion === "usa") return { jobs: usaJobs, isLoading: usaLoading };
    if (activeRegion === "india") return { jobs: indiaJobs, isLoading: indiaLoading };
    if (activeRegion === "middle-east") return { jobs: middleEastJobs, isLoading: middleEastLoading };
    return { jobs: [], isLoading: false };
  };

  const { jobs, isLoading } = getCurrentRegionData();

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
                {jobs?.length || 0} matching opportunities in {activeRegion.toUpperCase().replace('-', ' ')} (last 72 hours)
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
        {/* Region Tabs */}
        <Tabs value={activeRegion} onValueChange={(value) => setActiveRegion(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6" style={{ backgroundColor: 'rgba(128, 0, 128, 0.2)', border: '1px solid var(--neon-cyan)' }}>
            <TabsTrigger 
              value="usa" 
              style={{ 
                color: activeRegion === "usa" ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                borderBottom: activeRegion === "usa" ? '2px solid var(--neon-pink)' : 'none'
              }}
            >
              <Globe className="w-4 h-4 mr-2" />
              USA ({usaJobs?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="india"
              style={{ 
                color: activeRegion === "india" ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                borderBottom: activeRegion === "india" ? '2px solid var(--neon-pink)' : 'none'
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              INDIA ({indiaJobs?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="middle-east"
              style={{ 
                color: activeRegion === "middle-east" ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                borderBottom: activeRegion === "middle-east" ? '2px solid var(--neon-pink)' : 'none'
              }}
            >
              <Globe className="w-4 h-4 mr-2" />
              MIDDLE EAST ({middleEastJobs?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <Button className="btn-neon" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              REFRESH JOBS
            </Button>
          </div>

          {/* Tab Content */}
          {["usa", "india", "middle-east"].map((region) => (
            <TabsContent key={region} value={region}>
              {isLoading ? (
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', paddingBottom: '5rem' }}>
                  <Spinner style={{ width: '2rem', height: '2rem', color: 'var(--neon-cyan)' }} />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {jobs.map((job: any) => (
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
                        <div style={{ flex: 1, cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Briefcase style={{ width: '1.25rem', height: '1.25rem', color: 'var(--neon-cyan)' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-cyan)', transition: 'color 0.3s' }}>
                              {job.title}
                            </h3>
                          </div>
                          <p style={{ color: '#d1d5db', marginBottom: '0.75rem' }}>{job.company}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Badge variant="outline" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                              {job.site || 'Indeed'}
                            </Badge>
                            {job.location && (
                              <Badge variant="outline" style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}>
                                {job.location}
                              </Badge>
                            )}
                            {job.matchScore && (
                              <Badge style={{ backgroundColor: 'var(--neon-pink)', color: '#000', fontWeight: 'bold' }}>
                                Match: {Math.round(Number(job.matchScore) * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Relevance Score & Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                          {job.matchScore && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Star style={{ width: '1.25rem', height: '1.25rem', color: 'var(--neon-pink)', fill: 'var(--neon-pink)' }} />
                              <span style={{ color: 'var(--neon-pink)', fontWeight: 'bold' }}>
                                {Math.round(Number(job.matchScore) * 100)}%
                              </span>
                            </div>
                          )}
                          <Button
                            className="btn-neon"
                            style={{ fontSize: '0.875rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(job.id, job.job_url);
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
                          <p style={{ color: '#d1d5db', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {job.description || "No description available"}
                          </p>
                          {job.matchReason && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(128, 0, 128, 0.1)', borderLeft: '3px solid var(--neon-pink)' }}>
                              <p style={{ color: 'var(--neon-cyan)', fontSize: '0.875rem' }}>
                                <strong>Why it matches:</strong> {job.matchReason}
                              </p>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                              href={job.job_url}
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
                    No matching jobs found in {region.toUpperCase().replace('-', ' ')}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Jobs are filtered to match your profile (40%+ match score)
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
