/**
 * Job Fetcher Service
 * Fetches jobs from LinkedIn, Indeed, etc. using JobSpy
 */

import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import type { UserProfile } from "../drizzle/schema";

const execAsync = promisify(exec);

export interface FetchedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  job_url: string;
  date_posted: string;
  site: string;
  job_type?: string;
  salary_source?: string;
  interval?: string;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
}

/**
 * Fetch jobs in real-time based on user profile
 */
export async function fetchJobsRealTime(profile: {
  jobTitles: string[];
  locations: string[];
  experienceLevel?: string;
  resultsWanted?: number;
  hoursOld?: number;
  sites?: string[]; // Optional: specify which sites to scrape
}): Promise<FetchedJob[]> {
  try {
    // Combine job titles with OR
    const searchTerm = profile.jobTitles.join(" OR ");
    const location = profile.locations[0] || "Remote";
    const resultsWanted = profile.resultsWanted || 50;
    const hoursOld = profile.hoursOld || 48;
    const sites = profile.sites || ["indeed", "zip_recruiter"]; // Default sites

    console.log(`[JobFetcher] Fetching jobs:`, {
      searchTerm,
      location,
      resultsWanted,
      hoursOld,
      sites,
    });

    // Call Python script - use different path for production vs development
    const pythonPath = process.env.NODE_ENV === 'production' 
      ? 'python3'  // Railway/Render use standard python3
      : '/opt/homebrew/bin/python3.11';  // Local macOS development
    
    const scriptPath = join(process.cwd(), "scripts", "fetch-jobs.py");
    const sitesArg = sites.join(",");
    const command = `${pythonPath} "${scriptPath}" "${searchTerm}" "${location}" ${resultsWanted} ${hoursOld} "${sitesArg}"`;

    console.log(`[JobFetcher] Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
      timeout: 120000, // 2 minute timeout
    });

    if (stderr) {
      console.warn(`[JobFetcher] Warning:`, stderr);
    }

    // Parse JSON output
    const jobs = JSON.parse(stdout);

    if (jobs.error) {
      throw new Error(jobs.error);
    }

    console.log(`[JobFetcher] Found ${jobs.length} jobs`);

    // Transform to our format
    return jobs.map((job: any, index: number) => ({
      id: job.id || `${job.site}-${Date.now()}-${index}`,
      title: job.title || "Unknown Title",
      company: job.company || "Unknown Company",
      location: job.location || location,
      description: job.description || "",
      job_url: job.job_url || "",
      date_posted: job.date_posted || new Date().toISOString(),
      site: job.site || "unknown",
      job_type: job.job_type,
      salary_source: job.salary_source,
      interval: job.interval,
      min_amount: job.min_amount,
      max_amount: job.max_amount,
      currency: job.currency,
    }));
  } catch (error: any) {
    console.error("[JobFetcher] Error fetching jobs:", error.message);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
}

/**
 * Fetch jobs based on user profile
 */
export async function fetchJobsForProfile(
  profile: UserProfile
): Promise<FetchedJob[]> {
  // Profile data is already parsed by getUserProfile
  let jobTitles: string[] = ["Software Engineer"];
  let locations: string[] = ["Remote"];

  // Check if jobTitlePreferences is already an array or needs parsing
  if (profile.jobTitlePreferences) {
    if (Array.isArray(profile.jobTitlePreferences) && profile.jobTitlePreferences.length > 0) {
      jobTitles = profile.jobTitlePreferences;
    } else if (typeof profile.jobTitlePreferences === 'string') {
      try {
        const parsed = JSON.parse(profile.jobTitlePreferences);
        if (Array.isArray(parsed) && parsed.length > 0) {
          jobTitles = parsed;
        }
      } catch (e) {
        console.warn("[JobFetcher] Failed to parse jobTitlePreferences:", e);
      }
    }
  }

  // Check if targetLocations is already an array or needs parsing
  if (profile.targetLocations) {
    if (Array.isArray(profile.targetLocations) && profile.targetLocations.length > 0) {
      locations = profile.targetLocations;
    } else if (typeof profile.targetLocations === 'string') {
      try {
        const parsed = JSON.parse(profile.targetLocations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          locations = parsed;
        }
      } catch (e) {
        console.warn("[JobFetcher] Failed to parse targetLocations:", e);
      }
    }
  }

  // If no locations specified, use common US locations
  if (locations.length === 0) {
    locations = ["Remote", "United States"];
  }

  console.log("[JobFetcher] Using job titles:", jobTitles);
  console.log("[JobFetcher] Using locations:", locations);

  return fetchJobsRealTime({
    jobTitles,
    locations,
    resultsWanted: 30,  // Reduced for faster AI analysis
    hoursOld: 72,
  });
}
