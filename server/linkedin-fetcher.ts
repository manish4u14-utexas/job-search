/**
 * LinkedIn Job Fetcher Service using RapidAPI JSearch
 */

import type { FetchedJob } from "./job-fetcher";

export interface LinkedInSearchParams {
  keywords: string;
  location: string;
  datePosted: string; // "today", "3days", "week", "month"
  limit: number;
}

/**
 * Fetch jobs from LinkedIn using RapidAPI JSearch
 */
export async function fetchLinkedInJobs(params: LinkedInSearchParams): Promise<FetchedJob[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || "jsearch.p.rapidapi.com";
  const rapidApiEndpoint = process.env.RAPIDAPI_ENDPOINT || "https://jsearch.p.rapidapi.com/search";

  if (!rapidApiKey || rapidApiKey === "your-rapidapi-key-here") {
    console.warn("[LinkedIn] RAPIDAPI_KEY not configured - returning empty results");
    return [];
  }

  try {
    console.log(`[LinkedIn] Fetching jobs via RapidAPI:`, params);
    console.log(`[LinkedIn] Using API key: ${rapidApiKey.substring(0, 10)}...`);
    console.log(`[LinkedIn] Using host: ${rapidApiHost}`);
    console.log(`[LinkedIn] Using endpoint: ${rapidApiEndpoint}`);

    const url = new URL(rapidApiEndpoint);
    url.searchParams.append("query", `${params.keywords} in ${params.location}`);
    url.searchParams.append("page", "1");
    url.searchParams.append("num_pages", "1");
    url.searchParams.append("date_posted", params.datePosted);

    console.log(`[LinkedIn] Request URL: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
      },
    });

    console.log(`[LinkedIn] Response status: ${response.status}`);
    console.log(`[LinkedIn] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LinkedIn] Error response:`, errorText);
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[LinkedIn] Response data keys:`, Object.keys(data));
    
    // Handle different response formats
    let jobs = [];
    if (data.data && Array.isArray(data.data)) {
      jobs = data.data;
    } else if (data.jobs && Array.isArray(data.jobs)) {
      jobs = data.jobs;
    } else if (Array.isArray(data)) {
      jobs = data;
    }
    
    console.log(`[LinkedIn] Found ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.warn(`[LinkedIn] No jobs found in response. Full response:`, JSON.stringify(data, null, 2));
      return [];
    }

    // Log first job structure to understand the format
    if (jobs.length > 0) {
      console.log(`[LinkedIn] First job structure:`, Object.keys(jobs[0]));
    }

    // Transform API response to our format (flexible field mapping)
    return jobs.slice(0, params.limit).map((job: any, index: number) => ({
      id: job.job_id || job.id || `rapidapi-${Date.now()}-${index}`,
      title: job.job_title || job.title || "Unknown Title",
      company: job.employer_name || job.company || job.company_name || "Unknown Company",
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}, ${job.job_country || ''}`
        : job.location || job.job_location || job.job_country || params.location,
      description: job.job_description || job.description || "",
      job_url: job.job_apply_link || job.apply_link || job.job_url || job.url || job.job_google_link || "",
      date_posted: job.job_posted_at_datetime_utc || job.posted_at || job.date_posted || new Date().toISOString(),
      site: "rapidapi",
      job_type: job.job_employment_type || job.employment_type || job.job_type || "",
      min_amount: job.job_min_salary || job.min_salary,
      max_amount: job.job_max_salary || job.max_salary,
      currency: job.job_salary_currency || job.salary_currency,
      interval: job.job_salary_period || job.salary_period,
    }));
  } catch (error: any) {
    console.error("[LinkedIn] Error fetching jobs:", error.message);
    throw new Error(`Failed to fetch RapidAPI jobs: ${error.message}`);
  }
}

/**
 * Convert hours to JSearch datePosted format
 */
export function hoursToLinkedInDatePosted(hours: number): string {
  if (hours <= 24) return "today";
  if (hours <= 72) return "3days";
  if (hours <= 168) return "week"; // 7 days
  return "month";
}
