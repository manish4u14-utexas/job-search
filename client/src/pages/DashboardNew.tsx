import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
  User,
  List,
} from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [analyzedJobs, setAnalyzedJobs] = useState<Map<string, any>>(new Map());
  const [tailoredResumes, setTailoredResumes] = useState<Map<string, string>>(new Map());
  const [activeSource, setActiveSource] = useState<"indeed" | "linkedin">("indeed");
  const [hoursFilter, setHoursFilter] = useState<number>(72);
  const [jobsLimit, setJobsLimit] = useState<number>(10);
  
  // Cache for storing fetched jobs per source (persisted in localStorage)
  const [jobsCache, setJobsCache] = useState<{
    indeed?: { jobs: any[]; fetchedAt: string; rateLimitHit?: boolean; message?: string };
    linkedin?: { jobs: any[]; fetchedAt: string; rateLimitHit?: boolean; message?: string };
  }>(() => {
    // Load cache from localStorage on mount
    try {
      const saved = localStorage.getItem('jobsCache');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[Dashboard] Loaded cache from localStorage:', {
          indeed: parsed.indeed?.jobs?.length || 0,
          linkedin: parsed.linkedin?.jobs?.length || 0,
        });
        return parsed;
      }
    } catch (error) {
      console.error('[Dashboard] Error loading cache from localStorage:', error);
    }
    return {};
  });
  
  // Track viewed and applied jobs (persisted in localStorage)
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('viewedJobs');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[Dashboard] Error loading viewed jobs:', error);
    }
    return new Set();
  });
  
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('appliedJobs');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[Dashboard] Error loading applied jobs:', error);
    }
    return new Set();
  });
  
  // Manual fetch only - disabled by default
  const { data: jobData, isLoading, refetch, isRefetching, error: fetchError } = trpc.jobFeed.fetch.useQuery(
    {
      source: activeSource,
      hoursOld: hoursFilter,
      limit: jobsLimit,
    },
    {
      enabled: false, // Don't fetch automatically on mount or param changes
    }
  );

  // Update cache when data changes
  useEffect(() => {
    if (jobData) {
      console.log('[Dashboard] Received jobData from backend:', {
        source: activeSource,
        jobCount: jobData.jobs?.length,
        fetchedAt: jobData.fetchedAt,
        rateLimitHit: jobData.rateLimitHit,
        message: jobData.message,
        firstJob: jobData.jobs?.[0] ? { title: jobData.jobs[0].title, company: jobData.jobs[0].company } : null,
      });
      
      // Show toast notification if rate limit was hit
      if (jobData.rateLimitHit) {
        console.log('[Dashboard] Rate limit detected, showing toast notification');
        toast.warning('⚠️ API Rate Limit Reached', {
          description: jobData.jobs?.length === 0 
            ? 'No jobs could be analyzed. Wait 30 minutes or switch to OpenAI in Settings.'
            : `Showing all ${jobData.jobs.length} jobs. Some may not have AI match scores.`,
          duration: 10000,
        });
      }
      
      console.log('[Dashboard] Updating cache for source:', activeSource);
      const newCache = {
        ...jobsCache,
        [activeSource]: {
          jobs: jobData.jobs || [],
          fetchedAt: jobData.fetchedAt,
          rateLimitHit: jobData.rateLimitHit,
          message: jobData.message,
        },
      };
      setJobsCache(newCache);
      
      // Persist to localStorage
      try {
        localStorage.setItem('jobsCache', JSON.stringify(newCache));
        console.log('[Dashboard] Cache saved to localStorage');
      } catch (error) {
        console.error('[Dashboard] Error saving cache to localStorage:', error);
      }
    }
  }, [jobData, activeSource]);
  
  // Persist viewed jobs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viewedJobs', JSON.stringify(Array.from(viewedJobs)));
    } catch (error) {
      console.error('[Dashboard] Error saving viewed jobs:', error);
    }
  }, [viewedJobs]);
  
  // Persist applied jobs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('appliedJobs', JSON.stringify(Array.from(appliedJobs)));
    } catch (error) {
      console.error('[Dashboard] Error saving applied jobs:', error);
    }
  }, [appliedJobs]);

  // Show error toast when fetch fails
  useEffect(() => {
    if (fetchError) {
      const errorMessage = fetchError.message || 'Unknown error';
      
      // Detect specific error types
      if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        toast.error('⚠️ API Rate Limit Reached', {
          description: 'You\'ve hit the API rate limit. Try again in a few minutes or use fewer jobs.',
          duration: 10000,
        });
      } else if (errorMessage.includes('Profile not found')) {
        toast.error('❌ Profile Not Found', {
          description: 'Please complete your profile before searching for jobs.',
          duration: 8000,
        });
      } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        toast.error('🔑 API Key Issue', {
          description: 'There\'s a problem with your API key. Check Settings.',
          duration: 8000,
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        toast.error('🌐 Network Error', {
          description: 'Could not connect to the server. Check your internet connection.',
          duration: 8000,
        });
      } else {
        toast.error('❌ Job Search Failed', {
          description: errorMessage,
          duration: 8000,
        });
      }
    }
  }, [fetchError]);

  // Get jobs from cache for current source
  const cachedData = jobsCache[activeSource];
  const jobs = cachedData?.jobs || [];
  const fetchedAt = cachedData?.fetchedAt;
  const rateLimitHit = cachedData?.rateLimitHit || false;
  const message = cachedData?.message;

  // Debug logging
  console.log('[Dashboard] Current state:', {
    activeSource,
    jobCount: jobs.length,
    rateLimitHit,
    message,
    fetchedAt,
  });

  // Format last refresh time
  const formatRefreshTime = (isoString: string | undefined) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle source change
  const handleSourceChange = (source: "indeed" | "linkedin") => {
    setActiveSource(source);
  };

  // Handle time filter change
  const handleTimeFilterChange = (hours: number) => {
    setHoursFilter(hours);
  };

  // Handle jobs limit change
  const handleJobsLimitChange = (limit: number) => {
    setJobsLimit(limit);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
  };

  // Analyze specific job
  const { mutate: analyzeJob, isPending: analyzing } = trpc.jobFeed.analyzeJob.useMutation({
    onSuccess: (data, variables) => {
      setAnalyzedJobs((prev) => new Map(prev).set(variables.jobId, data));
      toast.success("Analysis complete!");
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  // Tailor resume for specific job
  const { mutate: tailorResume, isPending: tailoring } = trpc.jobMatcher.tailorResume.useMutation({
    onSuccess: (data, variables) => {
      // Store with the jobId we passed in
      const jobId = (variables as any).jobId;
      setTailoredResumes((prev) => new Map(prev).set(jobId, data.tailoredResume));
      toast.success("Resume tailored successfully!");
    },
    onError: (error) => {
      toast.error(`Resume tailoring failed: ${error.message}`);
    },
  });

  const handleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
    // Mark job as viewed when expanded
    if (expandedJobId !== jobId) {
      setViewedJobs((prev) => new Set(prev).add(jobId));
    }
  };

  const handleAnalyze = (job: any) => {
    analyzeJob({
      jobId: job.id,
      jobDescription: job.description,
    });
  };

  const handleTailorResume = (job: any) => {
    tailorResume({
      jobId: job.id,
      jobDescription: job.description,
    });
  };

  const handleApply = (jobUrl: string, jobId: string) => {
    // Mark job as applied
    setAppliedJobs((prev) => new Set(prev).add(jobId));
    // Also mark as viewed
    setViewedJobs((prev) => new Set(prev).add(jobId));
    // Open job URL
    window.open(jobUrl, "_blank");
  };
  
  const handleClearHistory = () => {
    if (confirm('Clear all viewed and applied job history?')) {
      setViewedJobs(new Set());
      setAppliedJobs(new Set());
      localStorage.removeItem('viewedJobs');
      localStorage.removeItem('appliedJobs');
      toast.success('Job history cleared!');
    }
  };
  
  const handleClearCache = () => {
    if (confirm('Clear all cached jobs? You will need to refresh to fetch new jobs.')) {
      setJobsCache({});
      localStorage.removeItem('jobsCache');
      toast.success('Cache cleared!');
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return "var(--neon-green)";
    if (score >= 0.6) return "var(--neon-cyan)";
    return "var(--neon-pink)";
  };

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: "bold",
                  color: "var(--neon-pink)",
                  marginBottom: "0.5rem",
                  fontFamily: "Orbitron, sans-serif",
                  textTransform: "uppercase",
                }}
              >
                JOB FEED
              </h1>
              <p style={{ color: "var(--neon-cyan)", marginBottom: "0.5rem" }}>
                {jobs?.length || 0} jobs found matching your profile
                {viewedJobs.size > 0 && (
                  <span style={{ marginLeft: "1rem", color: "#9ca3af", fontSize: "0.875rem" }}>
                    • {viewedJobs.size} viewed • {appliedJobs.size} applied
                  </span>
                )}
              </p>
              {rateLimitHit && (
                <div style={{ 
                  color: "var(--neon-pink)", 
                  fontSize: "0.875rem", 
                  marginBottom: "0.5rem",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255, 0, 110, 0.15)",
                  borderRadius: "0.25rem",
                  border: "2px solid var(--neon-pink)",
                  fontWeight: "bold",
                }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    ⚠️ RATE LIMIT REACHED
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                    {jobs.length === 0 
                      ? "No jobs could be analyzed. Wait 30 minutes or switch to OpenAI in Settings."
                      : `Showing all ${jobs.length} jobs. Some may not have AI match scores.`
                    }
                  </div>
                </div>
              )}
              {fetchError && (
                <p style={{ 
                  color: "var(--neon-pink)", 
                  fontSize: "0.875rem", 
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255, 0, 110, 0.1)",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--neon-pink)",
                }}>
                  ❌ Error: {fetchError.message}
                </p>
              )}
              {message && !rateLimitHit && !fetchError && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  {message}
                </p>
              )}
              {fetchedAt && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Last updated: {formatRefreshTime(fetchedAt)}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button
                className="btn-neon"
                onClick={handleRefresh}
                disabled={isRefetching}
              >
                <RefreshCw
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                {isRefetching ? "REFRESHING..." : "REFRESH"}
              </Button>
              <Button
                className="btn-neon"
                onClick={handleClearCache}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "var(--neon-pink)",
                  color: "var(--neon-pink)",
                }}
              >
                CLEAR CACHE
              </Button>
              <Button
                className="btn-neon"
                onClick={handleClearHistory}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#9ca3af",
                  color: "#9ca3af",
                }}
              >
                CLEAR HISTORY
              </Button>
              <Button className="btn-neon" onClick={() => navigate("/job-matcher")}>
                <Sparkles
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                JOB MATCHER
              </Button>
              <Button className="btn-neon" onClick={() => navigate("/settings")}>
                <SettingsIcon
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                SETTINGS
              </Button>
              <Button className="btn-neon" onClick={() => navigate("/profile")}>
                <User
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.5rem",
                  }}
                />
                PROFILE
              </Button>
            </div>
          </div>

          {/* Source Tabs and Time Filter */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* Source Tabs */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleSourceChange("indeed")}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: activeSource === "indeed" ? "var(--neon-cyan)" : "transparent",
                  color: activeSource === "indeed" ? "#000" : "var(--neon-cyan)",
                  border: `2px solid var(--neon-cyan)`,
                  borderRadius: "0.25rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textTransform: "uppercase",
                }}
              >
                INDEED
              </button>
              <button
                onClick={() => handleSourceChange("linkedin")}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: activeSource === "linkedin" ? "var(--neon-pink)" : "transparent",
                  color: activeSource === "linkedin" ? "#000" : "var(--neon-pink)",
                  border: `2px solid var(--neon-pink)`,
                  borderRadius: "0.25rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textTransform: "uppercase",
                }}
              >
                LINKEDIN (FREE)
              </button>
            </div>

            {/* Time Filter and Jobs Limit Dropdowns */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Time Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label
                  style={{
                    color: "var(--neon-cyan)",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                  }}
                >
                  TIME:
                </label>
                <select
                  value={hoursFilter}
                  onChange={(e) => handleTimeFilterChange(Number(e.target.value))}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#1a1a2e",
                    color: "var(--neon-cyan)",
                    border: "2px solid var(--neon-cyan)",
                    borderRadius: "0.25rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours</option>
                  <option value={72}>72 Hours</option>
                  <option value={168}>1 Week</option>
                </select>
              </div>

              {/* Jobs Limit Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label
                  style={{
                    color: "var(--neon-green)",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                  }}
                >
                  JOBS:
                </label>
                <select
                  value={jobsLimit}
                  onChange={(e) => handleJobsLimitChange(Number(e.target.value))}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#1a1a2e",
                    color: "var(--neon-green)",
                    border: "2px solid var(--neon-green)",
                    borderRadius: "0.25rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value={5}>5 Jobs</option>
                  <option value={10}>10 Jobs</option>
                  <option value={15}>15 Jobs</option>
                  <option value={20}>20 Jobs</option>
                  <option value={25}>25 Jobs</option>
                  <option value={30}>30 Jobs</option>
                </select>
              </div>
            </div>
          </div>
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
        {/* Error Display */}
        {fetchError && !isLoading && !isRefetching && (
          <Card className="hud-container" style={{ marginBottom: "1rem" }}>
            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: "var(--neon-pink)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                ❌ Job Search Failed
              </h3>
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "rgba(255, 0, 110, 0.1)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--neon-pink)",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ color: "#d1d5db", marginBottom: "0.5rem" }}>
                  <strong>Error:</strong> {fetchError.message}
                </p>
              </div>
              
              {/* Helpful suggestions based on error type */}
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ color: "var(--neon-cyan)", marginBottom: "0.75rem" }}>
                  💡 Possible Solutions:
                </h4>
                <ul style={{ color: "#9ca3af", paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                  {(fetchError.message.includes('Rate limit') || fetchError.message.includes('429')) && (
                    <>
                      <li>Wait a few minutes before trying again</li>
                      <li>Reduce the number of jobs (try 5 instead of 10)</li>
                      <li>Switch to a different LLM provider in Settings</li>
                      <li>Use Groq (free, 100K tokens/day) instead of OpenAI</li>
                    </>
                  )}
                  {fetchError.message.includes('Profile not found') && (
                    <>
                      <li>Go to Profile page and complete your profile</li>
                      <li>Upload your resume</li>
                      <li>Add job titles and locations</li>
                    </>
                  )}
                  {(fetchError.message.includes('API key') || fetchError.message.includes('authentication')) && (
                    <>
                      <li>Go to Settings and check your API key</li>
                      <li>Make sure the API key is valid and active</li>
                      <li>Try testing the LLM connection in Settings</li>
                    </>
                  )}
                  {(fetchError.message.includes('Network') || fetchError.message.includes('fetch')) && (
                    <>
                      <li>Check your internet connection</li>
                      <li>Make sure the server is running</li>
                      <li>Try refreshing the page</li>
                    </>
                  )}
                  {!fetchError.message.includes('Rate limit') && 
                   !fetchError.message.includes('Profile') && 
                   !fetchError.message.includes('API key') && 
                   !fetchError.message.includes('Network') && (
                    <>
                      <li>Try refreshing the page</li>
                      <li>Check the browser console for more details</li>
                      <li>Try a different source (Indeed vs LinkedIn)</li>
                      <li>Reduce the number of jobs to fetch</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                <Button className="btn-neon" onClick={() => refetch()}>
                  <RefreshCw style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  TRY AGAIN
                </Button>
                <Button className="btn-neon" onClick={() => navigate("/settings")}>
                  <SettingsIcon style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  GO TO SETTINGS
                </Button>
                <Button className="btn-neon" onClick={() => navigate("/profile")}>
                  <User style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  GO TO PROFILE
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "5rem",
              paddingBottom: "5rem",
            }}
          >
            <Spinner
              style={{
                width: "2rem",
                height: "2rem",
                color: "var(--neon-cyan)",
              }}
            />
            <span style={{ marginLeft: "1rem" }}>Fetching jobs from LinkedIn and Indeed...</span>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {jobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              const analysis = analyzedJobs.get(job.id);
              const isViewed = viewedJobs.has(job.id);
              const isApplied = appliedJobs.has(job.id);

              return (
                <Card 
                  key={job.id} 
                  className="hud-container"
                  style={{
                    position: "relative",
                    opacity: isApplied ? 0.7 : 1,
                    borderLeft: isApplied 
                      ? "4px solid var(--neon-green)" 
                      : isViewed 
                      ? "4px solid var(--neon-cyan)" 
                      : "none",
                  }}
                >
                  {/* Status Badge */}
                  {(isApplied || isViewed) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor: isApplied 
                          ? "rgba(57, 255, 20, 0.2)" 
                          : "rgba(0, 245, 255, 0.2)",
                        color: isApplied ? "var(--neon-green)" : "var(--neon-cyan)",
                        border: `1px solid ${isApplied ? "var(--neon-green)" : "var(--neon-cyan)"}`,
                      }}
                    >
                      {isApplied ? "✓ APPLIED" : "👁 VIEWED"}
                    </div>
                  )}
                  {/* Collapsed View */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => handleExpand(job.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                      {isExpanded ? (
                        <ChevronDown style={{ width: "1.5rem", height: "1.5rem" }} />
                      ) : (
                        <ChevronRight style={{ width: "1.5rem", height: "1.5rem" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <h3
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "bold",
                              color: "var(--neon-cyan)",
                            }}
                          >
                            {job.title}
                          </h3>
                          {job.matchScore && (
                            <span
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                color: job.matchScore >= 0.8 ? "var(--neon-green)" : job.matchScore >= 0.6 ? "var(--neon-cyan)" : "var(--neon-pink)",
                                backgroundColor: job.matchScore >= 0.8 ? "rgba(57, 255, 20, 0.1)" : job.matchScore >= 0.6 ? "rgba(0, 245, 255, 0.1)" : "rgba(255, 0, 110, 0.1)",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                                border: `1px solid ${job.matchScore >= 0.8 ? "var(--neon-green)" : job.matchScore >= 0.6 ? "var(--neon-cyan)" : "var(--neon-pink)"}`,
                              }}
                            >
                              {Math.round(job.matchScore * 100)}% MATCH
                            </span>
                          )}
                        </div>
                        <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                          {job.company} • {job.location} • {job.date_posted} • {job.site}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0, 245, 255, 0.2)" }}>
                      {/* Description */}
                      <div style={{ marginBottom: "1rem" }}>
                        <h4
                          style={{
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "var(--neon-cyan)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Description:
                        </h4>
                        <p
                          style={{
                            color: "#d1d5db",
                            fontSize: "0.875rem",
                            whiteSpace: "pre-wrap",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {job.description || "No description available"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <Button
                          className="btn-neon"
                          onClick={() => handleAnalyze(job)}
                          disabled={analyzing}
                        >
                          <Sparkles
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginRight: "0.5rem",
                            }}
                          />
                          {analyzing ? "ANALYZING..." : "ANALYZE MATCH"}
                        </Button>
                        <Button
                          className="btn-neon"
                          onClick={() => handleTailorResume(job)}
                          disabled={tailoring}
                          style={{
                            backgroundColor: "transparent",
                            borderColor: "var(--neon-green)",
                            color: "var(--neon-green)",
                          }}
                        >
                          <Sparkles
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginRight: "0.5rem",
                            }}
                          />
                          {tailoring ? "TAILORING..." : "TAILOR RESUME"}
                        </Button>
                        <Button
                          className="btn-neon"
                          onClick={() => handleApply(job.job_url, job.id)}
                        >
                          <ExternalLink
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginRight: "0.5rem",
                            }}
                          />
                          APPLY NOW
                        </Button>
                      </div>

                      {/* Analysis Results */}
                      {analysis && (
                        <div
                          style={{
                            padding: "1rem",
                            backgroundColor:
                              analysis.overallScore >= 0.8
                                ? "rgba(57, 255, 20, 0.05)"
                                : "rgba(255, 0, 110, 0.05)",
                            borderRadius: "0.5rem",
                            border: `1px solid ${getMatchColor(analysis.overallScore)}`,
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "bold",
                              color: getMatchColor(analysis.overallScore),
                              marginBottom: "1rem",
                            }}
                          >
                            {analysis.overallScore >= 0.8
                              ? "🟢 STRONG MATCH - APPLY NOW!"
                              : "🔴 NOT RECOMMENDED"}
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                              gap: "1rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                Overall Match
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "bold",
                                  color: getMatchColor(analysis.overallScore),
                                }}
                              >
                                {Math.round(analysis.overallScore * 100)}%
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                Skills Match
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "bold",
                                  color: "var(--neon-cyan)",
                                }}
                              >
                                {Math.round(analysis.skillsMatch * 100)}%
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                Experience Match
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "bold",
                                  color: "var(--neon-cyan)",
                                }}
                              >
                                {Math.round(analysis.experienceMatch * 100)}%
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "0.75rem",
                              backgroundColor: "rgba(0, 245, 255, 0.05)",
                              borderRadius: "0.5rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <strong>Analysis:</strong> {analysis.reasoning}
                          </div>
                          {analysis.visaSponsorshipNote && (
                            <div
                              style={{
                                padding: "0.75rem",
                                backgroundColor:
                                  analysis.visaSponsorship === "not-offered"
                                    ? "rgba(255, 0, 110, 0.1)"
                                    : analysis.visaSponsorship === "offered"
                                    ? "rgba(57, 255, 20, 0.1)"
                                    : "rgba(255, 165, 0, 0.1)",
                                borderRadius: "0.5rem",
                                border: `1px solid ${
                                  analysis.visaSponsorship === "not-offered"
                                    ? "var(--neon-pink)"
                                    : analysis.visaSponsorship === "offered"
                                    ? "var(--neon-green)"
                                    : "orange"
                                }`,
                              }}
                            >
                              <strong
                                style={{
                                  color:
                                    analysis.visaSponsorship === "not-offered"
                                      ? "var(--neon-pink)"
                                      : analysis.visaSponsorship === "offered"
                                      ? "var(--neon-green)"
                                      : "orange",
                                }}
                              >
                                {analysis.visaSponsorship === "not-offered"
                                  ? "⚠️ "
                                  : analysis.visaSponsorship === "offered"
                                  ? "✅ "
                                  : "ℹ️ "}
                                Visa Sponsorship:
                              </strong>{" "}
                              {analysis.visaSponsorshipNote}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tailored Resume */}
                      {tailoredResumes.get(job.id) && (
                        <div
                          style={{
                            padding: "1rem",
                            backgroundColor: "rgba(57, 255, 20, 0.05)",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--neon-green)",
                            marginTop: "1rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h4
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "bold",
                                color: "var(--neon-green)",
                              }}
                            >
                              ✨ Tailored Resume
                            </h4>
                            <Button
                              className="btn-neon"
                              onClick={() => {
                                const resume = tailoredResumes.get(job.id);
                                if (resume) {
                                  navigator.clipboard.writeText(resume);
                                  toast.success("Resume copied to clipboard!");
                                }
                              }}
                              style={{
                                fontSize: "0.875rem",
                                padding: "0.5rem 1rem",
                              }}
                            >
                              COPY TO CLIPBOARD
                            </Button>
                          </div>
                          <div
                            style={{
                              padding: "1rem",
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              borderRadius: "0.5rem",
                              maxHeight: "400px",
                              overflowY: "auto",
                            }}
                          >
                            <pre
                              style={{
                                color: "#d1d5db",
                                fontSize: "0.875rem",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                fontFamily: "monospace",
                                margin: 0,
                              }}
                            >
                              {tailoredResumes.get(job.id)}
                            </pre>
                          </div>
                          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.75rem" }}>
                            💡 This resume has been customized to highlight your relevant skills and experience for this specific job.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="hud-container">
            <div style={{ textAlign: "center", padding: "3rem" }}>
              {rateLimitHit && !fetchedAt ? (
                <>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--neon-pink)",
                      marginBottom: "1rem",
                    }}
                  >
                    ⚠️ Rate Limit Reached
                  </h3>
                  <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
                    Your API rate limit has been exceeded. No jobs could be analyzed.
                  </p>
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "rgba(255, 0, 110, 0.1)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--neon-pink)",
                      marginBottom: "1.5rem",
                      textAlign: "left",
                    }}
                  >
                    <h4 style={{ color: "var(--neon-cyan)", marginBottom: "0.75rem" }}>
                      💡 Solutions:
                    </h4>
                    <ul style={{ color: "#9ca3af", paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                      <li>Wait 30-60 minutes for your quota to reset</li>
                      <li>Switch to OpenAI in Settings (paid but unlimited)</li>
                      <li>Use fewer jobs next time (5 instead of 10)</li>
                      <li>Groq free tier: 100K tokens/day (~20 jobs)</li>
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                    <Button className="btn-neon" onClick={() => navigate("/settings")}>
                      <SettingsIcon
                        style={{
                          width: "1rem",
                          height: "1rem",
                          marginRight: "0.5rem",
                        }}
                      />
                      GO TO SETTINGS
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--neon-cyan)",
                      marginBottom: "1rem",
                    }}
                  >
                    {fetchedAt ? "No jobs found" : "Ready to search for jobs"}
                  </h3>
                  <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
                    {fetchedAt 
                      ? "Try adjusting your filters or update your profile preferences"
                      : "Click the REFRESH button to fetch jobs matching your profile"}
                  </p>
                  {fetchedAt ? (
                    <Button className="btn-neon" onClick={() => navigate("/profile")}>
                      UPDATE PROFILE
                    </Button>
                  ) : (
                    <Button className="btn-neon" onClick={handleRefresh}>
                      <RefreshCw
                        style={{
                          width: "1rem",
                          height: "1rem",
                          marginRight: "0.5rem",
                        }}
                      />
                      FETCH JOBS
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
