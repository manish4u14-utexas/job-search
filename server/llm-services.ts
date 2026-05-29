/**
 * LLM-based services for job matching and cover letter generation
 */

import { invokeLLM } from "./_core/llm-universal";
import { UserProfile, Job } from "../drizzle/schema";

/**
 * Calculate relevance score between a job and user profile using LLM
 * Returns a score from 0.00 to 1.00 with detailed breakdown
 */
export async function calculateJobRelevance(
  job: Partial<Job>,
  profile: UserProfile
): Promise<{
  score: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    titleMatch: number;
    reasoning: string;
    visaSponsorship: string; // "offered", "not-offered", "not-mentioned"
    visaSponsorshipNote: string;
  };
}> {
  const prompt = `You are an expert job matching AI. Analyze how well this job matches the candidate's profile.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "Not specified"}
Description: ${job.description || "Not provided"}
Requirements: ${job.requirements || "Not provided"}

CANDIDATE PROFILE:
Current Title: ${profile.currentJobTitle || "Not specified"}
Years of Experience: ${profile.yearsOfExperience || 0}
Skills: ${profile.skills?.join(", ") || "None listed"}
Preferred Job Titles: ${profile.jobTitlePreferences?.join(", ") || "None listed"}
Target Locations: ${profile.targetLocations?.join(", ") || "None listed"}

Analyze the match and provide:
1. Overall relevance score (0.00 to 1.00)
2. Skills match score (0.00 to 1.00)
3. Experience match score (0.00 to 1.00)
4. Location match score (0.00 to 1.00)
5. Title match score (0.00 to 1.00)
6. Brief reasoning (2-3 sentences)
7. Visa sponsorship status: "offered", "not-offered", or "not-mentioned"
8. Visa sponsorship note: A clear statement about visa sponsorship (e.g., "This position does not offer visa sponsorship" or "Visa sponsorship may be available" or "Visa sponsorship not mentioned in job description")

IMPORTANT: Look for phrases like:
- "does not offer work authorization sponsorship"
- "must have valid U.S. work authorization"
- "no visa sponsorship"
- "will sponsor"
- "H1B sponsorship available"

Return ONLY valid JSON with this exact structure:
{
  "overallScore": 0.85,
  "skillsMatch": 0.90,
  "experienceMatch": 0.80,
  "locationMatch": 1.00,
  "titleMatch": 0.85,
  "reasoning": "Strong match based on skills and experience...",
  "visaSponsorship": "not-offered",
  "visaSponsorshipNote": "This position does not offer work authorization sponsorship."
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a job matching expert. Analyze job-candidate fit and return structured JSON scores.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "job_match_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallScore: {
                type: "number",
                description: "Overall relevance score from 0.00 to 1.00",
              },
              skillsMatch: {
                type: "number",
                description: "Skills match score from 0.00 to 1.00",
              },
              experienceMatch: {
                type: "number",
                description: "Experience match score from 0.00 to 1.00",
              },
              locationMatch: {
                type: "number",
                description: "Location match score from 0.00 to 1.00",
              },
              titleMatch: {
                type: "number",
                description: "Job title match score from 0.00 to 1.00",
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the match analysis",
              },
              visaSponsorship: {
                type: "string",
                enum: ["offered", "not-offered", "not-mentioned"],
                description: "Visa sponsorship status",
              },
              visaSponsorshipNote: {
                type: "string",
                description: "Clear statement about visa sponsorship availability",
              },
            },
            required: [
              "overallScore",
              "skillsMatch",
              "experienceMatch",
              "locationMatch",
              "titleMatch",
              "reasoning",
              "visaSponsorship",
              "visaSponsorshipNote",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    const analysis = JSON.parse(content);

    return {
      score: analysis.overallScore,
      breakdown: {
        skillsMatch: analysis.skillsMatch,
        experienceMatch: analysis.experienceMatch,
        locationMatch: analysis.locationMatch,
        titleMatch: analysis.titleMatch,
        reasoning: analysis.reasoning,
        visaSponsorship: analysis.visaSponsorship || "not-mentioned",
        visaSponsorshipNote: analysis.visaSponsorshipNote || "Visa sponsorship information not found in job description.",
      },
    };
  } catch (error) {
    console.error("Error calculating job relevance:", error);
    
    // Re-throw rate limit errors so they can be handled by the caller
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('Rate limit') || 
      errorMessage.includes('429') || 
      errorMessage.includes('Too many requests') ||
      errorMessage.includes('rate_limit_exceeded') ||
      errorMessage.toLowerCase().includes('quota')
    ) {
      throw error; // Re-throw rate limit errors
    }
    
    // Return default low score for other errors
    return {
      score: 0.0,
      breakdown: {
        skillsMatch: 0.0,
        experienceMatch: 0.0,
        locationMatch: 0.0,
        titleMatch: 0.0,
        reasoning: "Error analyzing job match",
        visaSponsorship: "not-mentioned",
        visaSponsorshipNote: "Could not analyze visa sponsorship due to error.",
      },
    };
  }
}

/**
 * Generate a tailored cover letter for a specific job
 */
export async function generateCoverLetter(
  job: Partial<Job>,
  profile: UserProfile
): Promise<string> {
  const prompt = `Generate a professional, compelling cover letter for this job application.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "Not specified"}
Description: ${job.description || "Not provided"}
Requirements: ${job.requirements || "Not provided"}

CANDIDATE PROFILE:
Current Title: ${profile.currentJobTitle || "Not specified"}
Years of Experience: ${profile.yearsOfExperience || 0}
Skills: ${profile.skills?.join(", ") || "None listed"}
Resume Summary: ${profile.resumeText?.substring(0, 1000) || "Not provided"}

Write a compelling cover letter that:
1. Opens with enthusiasm for the specific role and company
2. Highlights 2-3 most relevant skills/experiences that match the job requirements
3. Demonstrates understanding of the company/role
4. Closes with a strong call to action
5. Keeps it concise (250-350 words)
6. Uses professional but engaging tone
7. Avoids generic phrases

Format as a complete cover letter ready to send.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach and cover letter writer. Create compelling, personalized cover letters that highlight candidate strengths.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    return content.trim();
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.

With ${profile.yearsOfExperience || 0} years of experience and expertise in ${profile.skills?.slice(0, 3).join(", ") || "relevant technologies"}, I am confident I would be a valuable addition to your team.

I would welcome the opportunity to discuss how my background and skills align with your needs.

Thank you for your consideration.

Best regards`;
  }
}

/**
 * Extract recruiter contact information from job description using LLM
 */
export async function extractRecruiterInfo(
  jobDescription: string,
  jobUrl: string
): Promise<{
  name?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  title?: string;
}> {
  const prompt = `Extract recruiter or hiring manager contact information from this job posting.

JOB DESCRIPTION:
${jobDescription}

JOB URL:
${jobUrl}

Look for:
- Recruiter/hiring manager name
- Email address
- LinkedIn profile URL
- Phone number
- Job title/role

Return ONLY valid JSON with any found information. Use null for missing fields.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting contact information from job postings. Return structured JSON data.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recruiter_info",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: {
                type: ["string", "null"],
                description: "Recruiter or hiring manager name",
              },
              email: {
                type: ["string", "null"],
                description: "Contact email address",
              },
              linkedinUrl: {
                type: ["string", "null"],
                description: "LinkedIn profile URL",
              },
              phone: {
                type: ["string", "null"],
                description: "Contact phone number",
              },
              title: {
                type: ["string", "null"],
                description: "Recruiter job title",
              },
            },
            required: [],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return {};
    }

    const info = JSON.parse(content);
    // Filter out null values
    return Object.fromEntries(
      Object.entries(info).filter(([_, v]) => v !== null)
    );
  } catch (error) {
    console.error("Error extracting recruiter info:", error);
    return {};
  }
}

/**
 * Parse and extract key information from resume text
 */
export async function parseResumeText(
  resumeText: string
): Promise<{
  skills: string[];
  jobTitlePreferences: string[];
  yearsOfExperience: number;
  currentJobTitle: string;
}> {
  const prompt = `Extract structured information from this resume:

${resumeText}

Extract:
1. List of technical and professional skills
2. Most recent/current job title
3. Total years of professional experience (estimate if not explicit)
4. Potential job titles this person would be qualified for

Return ONLY valid JSON.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume parser. Extract structured data from resumes accurately.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
                description: "List of skills found in resume",
              },
              currentJobTitle: {
                type: "string",
                description: "Most recent or current job title",
              },
              yearsOfExperience: {
                type: "integer",
                description: "Total years of professional experience",
              },
              jobTitlePreferences: {
                type: "array",
                items: { type: "string" },
                description: "Potential job titles candidate would qualify for",
              },
            },
            required: [
              "skills",
              "currentJobTitle",
              "yearsOfExperience",
              "jobTitlePreferences",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {
      skills: [],
      jobTitlePreferences: [],
      yearsOfExperience: 0,
      currentJobTitle: "",
    };
  }
}

/**
 * Tailor resume to match job description while preserving format
 */
export async function tailorResume(
  originalResume: string,
  jobDescription: string,
  profile: UserProfile
): Promise<string> {
  const prompt = `You are an expert resume writer. Tailor this resume to match the job description while preserving the original format and structure.

ORIGINAL RESUME:
${originalResume}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
- Current Title: ${profile.currentJobTitle || "Not specified"}
- Years of Experience: ${profile.yearsOfExperience || 0}
- Skills: ${profile.skills?.join(", ") || "None listed"}

INSTRUCTIONS:
1. Analyze the job requirements and identify key skills/qualifications needed
2. Restructure the resume to highlight relevant experience that matches the job
3. Emphasize skills and achievements that align with the job description
4. Keep the same format, structure, and style as the original resume
5. Do NOT add false information - only reorganize and emphasize existing content
6. Do NOT change dates, company names, or factual information
7. Add a professional summary at the top that highlights fit for this specific role
8. Use keywords from the job description naturally throughout
9. Keep the resume concise and impactful (1-2 pages)

Return the complete tailored resume ready to submit.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer who tailors resumes to specific job descriptions while maintaining authenticity and format.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    return content.trim();
  } catch (error) {
    console.error("Error tailoring resume:", error);
    return `Error: Unable to tailor resume. Please try again or check your LLM configuration.

Original resume:
${originalResume}`;
  }
}
