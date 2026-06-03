import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProfile,
  upsertUserProfile,
  getJobsByUserId,
  getRecentJobs,
  insertJob,
  getApplicationsByUserId,
  upsertApplication,
  getRecruiterByJobId,
  getCoverLetterByJobId,
  upsertCoverLetter,
  insertRecruiter,
  getDb,
} from "./db";
import {
  calculateJobRelevance,
  generateCoverLetter,
  extractRecruiterInfo,
  parseResumeText,
} from "./llm-services";
import { jobs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getLLMSettings, saveLLMSettings } from "./settings-store";
import { invokeLLM } from "./_core/llm-universal";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: publicProcedure.query(async ({ ctx }) => {
      // For development without auth, return mock user ID
      const userId = ctx.user?.id || 1;
      return getUserProfile(userId);
    }),
    update: publicProcedure
      .input(
        z.object({
          resumeText: z.string().optional(),
          resumeUrl: z.string().optional(),
          skills: z.array(z.string()).optional(),
          jobTitlePreferences: z.array(z.string()).optional(),
          targetLocations: z.array(z.string()).optional(),
          yearsOfExperience: z.number().optional(),
          currentJobTitle: z.string().optional(),
          notificationThreshold: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const userId = ctx.user?.id || 1;
          console.log("Updating profile for user:", userId, "with data:", input);
          const result = await upsertUserProfile(userId, input);
          console.log("Profile updated successfully");
          return result;
        } catch (error) {
          console.error("Error updating profile:", error);
          throw new Error(
            `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),
    uploadFile: publicProcedure
      .input(
        z.object({
          fileData: z.string(), // base64 encoded file
          mimeType: z.string(),
          fileName: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          console.log("uploadFile called:", {
            fileName: input.fileName,
            mimeType: input.mimeType,
            dataLength: input.fileData.length,
          });
          
          const { parseFile } = await import("./file-parser");
          
          // Decode base64 to buffer
          const buffer = Buffer.from(input.fileData, "base64");
          console.log("Buffer created, size:", buffer.length);
          
          // Parse file based on type
          const text = await parseFile(buffer, input.mimeType);
          console.log("File parsed successfully, text length:", text.length);
          
          return { text };
        } catch (error) {
          console.error("Error in uploadFile:", error);
          throw new Error(
            `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),
    parseResume: publicProcedure
      .input(z.object({ resumeText: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const userId = ctx.user?.id || 1;
          console.log("Parsing resume for user:", userId, "text length:", input.resumeText.length);
          const parsed = await parseResumeText(input.resumeText);
          console.log("Resume parsed successfully:", parsed);
          
          // Ensure arrays are not undefined
          const safeParsed = {
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            jobTitlePreferences: Array.isArray(parsed.jobTitlePreferences) ? parsed.jobTitlePreferences : [],
            yearsOfExperience: parsed.yearsOfExperience || 0,
            currentJobTitle: parsed.currentJobTitle || "",
          };
          
          // Auto-update profile with parsed data
          await upsertUserProfile(userId, {
            resumeText: input.resumeText,
            ...safeParsed,
          });
          console.log("Profile auto-updated with parsed data");
          
          return safeParsed;
        } catch (error) {
          console.error("Error parsing resume:", error);
          throw new Error(
            `Failed to parse resume: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),
  }),

  jobs: router({
    getRecent: publicProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id || 1;
      return getRecentJobs(userId, 48);
    }),
    getAll: publicProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        return getJobsByUserId(
          userId,
          input?.limit || 50,
          input?.offset || 0
        );
      }),
    getById: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, input.jobId))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),
    analyzeMatch: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const jobResult = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, input.jobId))
          .limit(1);

        if (jobResult.length === 0) {
          throw new Error("Job not found");
        }

        const job = jobResult[0];
        const analysis = await calculateJobRelevance(job, profile);

        // Update job with relevance score
        await db
          .update(jobs)
          .set({
            relevanceScore: analysis.score.toString(),
            matchBreakdown: analysis.breakdown,
          })
          .where(eq(jobs.id, input.jobId));

        return analysis;
      }),
    extractRecruiter: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const jobResult = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, input.jobId))
          .limit(1);

        if (jobResult.length === 0) {
          throw new Error("Job not found");
        }

        const job = jobResult[0];
        const recruiterInfo = await extractRecruiterInfo(
          job.description || "",
          job.url
        );

        // Save recruiter info if found
        if (Object.keys(recruiterInfo).length > 0) {
          await insertRecruiter({
            jobId: input.jobId,
            name: recruiterInfo.name,
            email: recruiterInfo.email,
            linkedinUrl: recruiterInfo.linkedinUrl,
            phone: recruiterInfo.phone,
            title: recruiterInfo.title,
            company: job.company,
          });
        }

        return recruiterInfo;
      }),
  }),

  applications: router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id || 1;
      return getApplicationsByUserId(userId);
    }),
    updateStatus: publicProcedure
      .input(
        z.object({
          jobId: z.number(),
          status: z.enum(["new", "saved", "applied", "interviewing", "rejected"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        return upsertApplication(userId, input.jobId, input.status);
      }),
  }),

  coverLetters: router({
    get: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        return getCoverLetterByJobId(userId, input.jobId);
      }),
    generate: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const jobResult = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, input.jobId))
          .limit(1);

        if (jobResult.length === 0) {
          throw new Error("Job not found");
        }

        const job = jobResult[0];
        const content = await generateCoverLetter(job, profile);

        await upsertCoverLetter(userId, input.jobId, content);

        return { content };
      }),
  }),

  recruiters: router({
    getByJobId: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getRecruiterByJobId(input.jobId);
      }),
  }),

  settings: router({
    // Get all LLM configurations
    getAllLLM: publicProcedure.query(async () => {
      const { getAllLLMSettings } = await import("./settings-store");
      const allSettings = await getAllLLMSettings();
      
      if (!allSettings) {
        return {
          activeProvider: "openai" as const,
          providers: {}
        };
      }
      
      // Mask API keys for security
      const maskedProviders: any = {};
      for (const [key, config] of Object.entries(allSettings.providers)) {
        if (config) {
          maskedProviders[key] = {
            ...config,
            apiKey: config.apiKey ? "***" + config.apiKey.slice(-4) : ""
          };
        }
      }
      
      return {
        activeProvider: allSettings.activeProvider,
        providers: maskedProviders
      };
    }),
    
    // Get active LLM configuration (backward compatibility)
    getLLM: publicProcedure.query(async () => {
      const settings = await getLLMSettings();
      if (!settings) {
        return {
          provider: "openai",
          apiKey: "",
          model: "",
          baseURL: "",
          isConfigured: false,
        };
      }
      // Don't send full API key to frontend
      return {
        ...settings,
        apiKey: settings.apiKey ? "***" + settings.apiKey.slice(-4) : "",
      };
    }),
    
    // Save/update LLM provider configuration
    saveLLM: publicProcedure
      .input(
        z.object({
          provider: z.enum(["openai", "groq", "anthropic", "custom"]),
          apiKey: z.string(),
          model: z.string().optional(),
          baseURL: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Settings] Saving LLM settings:", {
          provider: input.provider,
          hasApiKey: !!input.apiKey,
          apiKeyPrefix: input.apiKey.substring(0, 10) + "...",
          model: input.model,
          baseURL: input.baseURL,
        });
        
        await saveLLMSettings(input);
        
        // Reset LLM client to use new settings
        const { resetLLMClient } = await import("./_core/llm-universal");
        resetLLMClient();
        
        console.log("[Settings] LLM settings saved and client reset");
        return { success: true };
      }),
    
    // Switch active LLM provider
    switchProvider: publicProcedure
      .input(z.object({
        provider: z.enum(["openai", "groq", "anthropic", "custom"])
      }))
      .mutation(async ({ input }) => {
        console.log("[Settings] Switching to provider:", input.provider);
        
        const { switchActiveProvider } = await import("./settings-store");
        await switchActiveProvider(input.provider);
        
        console.log("[Settings] Provider switched successfully");
        return { success: true, activeProvider: input.provider };
      }),
    
    testLLM: publicProcedure.mutation(async () => {
      try {
        console.log("[Settings] Testing LLM connection...");
        
        // Get current settings to verify
        const settings = await getLLMSettings();
        console.log("[Settings] Current settings:", {
          provider: settings?.provider,
          hasApiKey: !!settings?.apiKey,
          apiKeyPrefix: settings?.apiKey?.substring(0, 10) + "...",
          model: settings?.model,
          baseURL: settings?.baseURL,
        });
        
        if (!settings || !settings.apiKey) {
          throw new Error("No LLM settings found. Please save settings first.");
        }
        
        // Force reload of LLM client
        const llmUniversal = await import("./_core/llm-universal");
        llmUniversal.resetLLMClient();
        
        const response = await llmUniversal.invokeLLM({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'Connection successful' if you can read this." },
          ],
        });
        
        if (response.choices[0]?.message?.content) {
          console.log("[Settings] LLM test successful");
          return { success: true, message: "LLM connection successful!" };
        }
        throw new Error("No response from LLM");
      } catch (error: any) {
        console.error("[Settings] LLM test failed:", error.message);
        throw new Error(`LLM connection failed: ${error.message}`);
      }
    }),
  }),

  jobMatcher: router({
    analyzeJob: publicProcedure
      .input(z.object({ jobDescription: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }

        // Create a temporary job object from the description
        const tempJob = {
          title: "Job Position",
          company: "Company",
          description: input.jobDescription,
          requirements: input.jobDescription,
          location: "",
        };

        const analysis = await calculateJobRelevance(tempJob, profile);

        return {
          overallScore: analysis.score,
          skillsMatch: analysis.breakdown.skillsMatch,
          experienceMatch: analysis.breakdown.experienceMatch,
          locationMatch: analysis.breakdown.locationMatch,
          titleMatch: analysis.breakdown.titleMatch,
          reasoning: analysis.breakdown.reasoning,
          visaSponsorship: analysis.breakdown.visaSponsorship,
          visaSponsorshipNote: analysis.breakdown.visaSponsorshipNote,
        };
      }),
    tailorResume: publicProcedure
      .input(z.object({ jobDescription: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }

        if (!profile.resumeText) {
          throw new Error("No resume found. Please add your resume to your profile first.");
        }

        const { tailorResume } = await import("./llm-services");
        const tailoredResume = await tailorResume(
          profile.resumeText,
          input.jobDescription,
          profile
        );

        return { tailoredResume };
      }),
  }),

  jobFeed: router({
    fetch: publicProcedure
      .input(z.object({
        source: z.enum(["indeed", "linkedin"]).default("indeed"),
        region: z.enum(["usa", "india", "middle-east", "all"]).default("all"),
        hoursOld: z.number().default(72),
        limit: z.number().default(10),
      }).optional())
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }
        
        const source = input?.source || "indeed";
        const region = input?.region || "all";
        const hoursOld = input?.hoursOld || 72;
        const limit = input?.limit || 10;
        
        console.log(`[JobFeed] Fetching ${source} jobs from ${region} (last ${hoursOld} hours, limit: ${limit})...`);
        
        // Determine locations and country based on region
        let locations: string[];
        let country: string;
        let sites: string[];
        
        if (region === "usa") {
          locations = ["Remote", "United States", "New York", "San Francisco", "Austin"];
          country = "USA";
          sites = ["indeed", "zip_recruiter"];
        } else if (region === "india") {
          locations = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Noida", "Gurgaon", "Gurugram", "Ahmedabad", "Kolkata", "Jaipur"];
          country = "India";
          sites = ["indeed"];
        } else if (region === "middle-east") {
          locations = ["Dubai", "Abu Dhabi", "Riyadh", "Doha", "Kuwait City"];
          country = "UAE";
          sites = ["bayt"];
        } else {
          // "all" - use profile preferences
          const jobTitles = Array.isArray(profile.jobTitlePreferences) 
            ? profile.jobTitlePreferences 
            : ["Product Manager"];
          locations = Array.isArray(profile.targetLocations) && profile.targetLocations.length > 0
            ? profile.targetLocations
            : ["Remote", "United States"];
          
          // Auto-detect country from profile locations
          const locationStr = locations.join(" ").toLowerCase();
          if (locationStr.includes("india") || locationStr.includes("bangalore") || 
              locationStr.includes("mumbai") || locationStr.includes("delhi")) {
            country = "India";
            sites = ["indeed"];
          } else if (locationStr.includes("dubai") || locationStr.includes("uae") || 
                     locationStr.includes("middle east")) {
            country = "UAE";
            sites = ["bayt"];
          } else {
            country = "USA";
            sites = ["indeed", "zip_recruiter"];
          }
        }
        
        let allJobs: any[] = [];
        
        if (source === "linkedin") {
          // LinkedIn via JobSpy (free, no API key needed!)
          const { fetchJobsRealTime } = await import("./job-fetcher");
          const jobTitles = Array.isArray(profile.jobTitlePreferences) 
            ? profile.jobTitlePreferences 
            : ["Product Manager"];
          const locations = Array.isArray(profile.targetLocations) && profile.targetLocations.length > 0
            ? profile.targetLocations
            : ["Remote", "United States"];
          
          allJobs = await fetchJobsRealTime({
            jobTitles,
            locations,
            resultsWanted: limit,
            hoursOld,
            sites: ["linkedin"], // Use JobSpy to scrape LinkedIn directly
            country,
          });
        } else {
          // Indeed via JobSpy
          const { fetchJobsRealTime } = await import("./job-fetcher");
          const jobTitles = Array.isArray(profile.jobTitlePreferences) 
            ? profile.jobTitlePreferences 
            : ["Product Manager"];
          
          allJobs = await fetchJobsRealTime({
            jobTitles,
            locations,
            resultsWanted: limit,
            hoursOld,
            sites,
            country,
          });
        }
        
        console.log(`[JobFeed] Fetched ${allJobs.length} jobs from ${source}`);
        
        // Deduplicate jobs by URL, ID, and title+company combination
        const uniqueJobs = [];
        const seenUrls = new Set();
        const seenIds = new Set();
        const seenTitleCompany = new Set();
        
        for (const job of allJobs) {
          const jobUrl = job.job_url || '';
          const jobId = job.id || '';
          const titleCompanyKey = `${job.title?.toLowerCase()?.trim()}-${job.company?.toLowerCase()?.trim()}`;
          
          // Skip if we've seen this URL, ID, or title+company combo before
          if (
            (jobUrl && seenUrls.has(jobUrl)) || 
            (jobId && seenIds.has(jobId)) ||
            seenTitleCompany.has(titleCompanyKey)
          ) {
            console.log(`[JobFeed] Skipping duplicate job: ${job.title} at ${job.company}`);
            continue;
          }
          
          if (jobUrl) seenUrls.add(jobUrl);
          if (jobId) seenIds.add(jobId);
          seenTitleCompany.add(titleCompanyKey);
          uniqueJobs.push(job);
        }
        
        console.log(`[JobFeed] After deduplication: ${uniqueJobs.length} unique jobs (removed ${allJobs.length - uniqueJobs.length} duplicates)`);
        
        // Use AI to match jobs against profile
        const matchedJobs = [];
        let rateLimitHit = false;
        
        for (let i = 0; i < uniqueJobs.length; i++) {
          const job = uniqueJobs[i];
          
          try {
            // Add delay between API calls to avoid rate limits (500ms)
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Quick AI analysis to determine if job matches profile
            const analysis = await calculateJobRelevance(
              {
                title: job.title,
                company: job.company,
                description: job.description,
                requirements: job.description,
                location: job.location,
              },
              profile
            );
            
            // Only include jobs with 40%+ match (lowered from 50% to show more results)
            if (analysis.score >= 0.4) {
              matchedJobs.push({
                ...job,
                matchScore: analysis.score,
                matchReason: analysis.breakdown.reasoning,
              });
            }
          } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[JobFeed] Error analyzing job ${job.id}:`, errorMessage);
            
            // Check if it's a rate limit error (check for 429 status or rate limit keywords)
            const isRateLimitError = 
              errorMessage.includes('Rate limit') || 
              errorMessage.includes('429') || 
              errorMessage.includes('Too many requests') ||
              errorMessage.includes('rate_limit_exceeded') ||
              errorMessage.toLowerCase().includes('quota');
            
            if (isRateLimitError) {
              console.warn(`[JobFeed] ⚠️ Rate limit hit after analyzing ${i} jobs - returning all remaining jobs without analysis`);
              rateLimitHit = true;
              // Add current job and all remaining jobs without analysis
              matchedJobs.push(job);
              const remainingJobs = uniqueJobs.slice(i + 1);
              console.log(`[JobFeed] Adding ${remainingJobs.length} remaining jobs without analysis (current job already added)`);
              matchedJobs.push(...remainingJobs);
              console.log(`[JobFeed] Total jobs in matchedJobs after rate limit: ${matchedJobs.length}`);
              break;
            } else {
              // For other errors, include the job anyway
              matchedJobs.push(job);
            }
          }
        }
        
        // Sort by match score (highest first), jobs without scores go to end
        matchedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        // Check if we got any jobs at all
        const hasAnyJobs = matchedJobs.length > 0;
        const hasAnalyzedJobs = matchedJobs.some(job => job.matchScore !== undefined);
        
        if (rateLimitHit) {
          console.log(`[JobFeed] ⚠️ Rate limit hit - showing all ${matchedJobs.length} jobs (some without AI analysis)`);
        } else if (!hasAnyJobs) {
          console.log(`[JobFeed] ⚠️ No jobs matched your profile (all filtered out)`);
        } else if (!hasAnalyzedJobs) {
          console.log(`[JobFeed] ⚠️ Rate limit hit before any jobs could be analyzed`);
          rateLimitHit = true; // Set this so frontend knows
        } else {
          console.log(`[JobFeed] ✓ Filtered to ${matchedJobs.length} relevant jobs (40%+ match)`);
        }
        
        // Determine appropriate message
        let message = '';
        if (rateLimitHit && !hasAnyJobs) {
          message = `⚠️ Rate limit reached before any jobs could be analyzed. Please wait 30 minutes or switch to a different LLM provider in Settings.`;
        } else if (rateLimitHit && !hasAnalyzedJobs) {
          message = `⚠️ Rate limit reached before any jobs could be analyzed. Showing all ${matchedJobs.length} jobs without AI match scores.`;
        } else if (rateLimitHit) {
          message = `⚠️ Rate limit reached after analyzing ${matchedJobs.filter(j => j.matchScore).length} jobs. Showing all ${matchedJobs.length} jobs (some without AI analysis).`;
        } else if (!hasAnyJobs) {
          message = `No jobs matched your profile criteria (40%+ match required). Try adjusting your profile or search filters.`;
        } else {
          message = `Found ${matchedJobs.length} jobs matching your profile (40%+ match).`;
        }
        
        console.log(`[JobFeed] Returning response:`, {
          jobCount: matchedJobs.length,
          source,
          hoursOld,
          rateLimitHit,
          message,
          sampleJob: matchedJobs[0] ? { title: matchedJobs[0].title, company: matchedJobs[0].company } : null,
        });
        
        return {
          jobs: matchedJobs,
          source,
          hoursOld,
          fetchedAt: new Date().toISOString(),
          rateLimitHit,
          message,
        };
      }),
    analyzeJob: publicProcedure
      .input(z.object({ 
        jobId: z.string(),
        jobDescription: z.string() 
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || 1;
        const profile = await getUserProfile(userId);
        
        if (!profile) {
          throw new Error("Profile not found. Please complete your profile first.");
        }
        
        // Create a temporary job object from the description
        const tempJob = {
          title: "Job Position",
          company: "Company",
          description: input.jobDescription,
          requirements: input.jobDescription,
          location: "",
        };

        const analysis = await calculateJobRelevance(tempJob, profile);

        return {
          overallScore: analysis.score,
          skillsMatch: analysis.breakdown.skillsMatch,
          experienceMatch: analysis.breakdown.experienceMatch,
          locationMatch: analysis.breakdown.locationMatch,
          titleMatch: analysis.breakdown.titleMatch,
          reasoning: analysis.breakdown.reasoning,
          visaSponsorship: analysis.breakdown.visaSponsorship,
          visaSponsorshipNote: analysis.breakdown.visaSponsorshipNote,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
