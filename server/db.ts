import { eq } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, userProfiles, InsertUserProfile, jobs, InsertJob, applications, recruiters, InsertRecruiter, coverLetters } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzleMysql> | ReturnType<typeof drizzleSqlite> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const dbUrl = process.env.DATABASE_URL;
      
      // Check if it's SQLite
      if (dbUrl.startsWith("sqlite:") || dbUrl.startsWith("file:")) {
        const sqlitePath = dbUrl.replace("sqlite:", "").replace("file:", "");
        const client = createClient({
          url: `file:${sqlitePath}`,
        });
        _db = drizzleSqlite(client) as any;
        console.log("[Database] Connected to SQLite:", sqlitePath);
      } else {
        // MySQL connection
        _db = drizzleMysql(dbUrl) as any;
        console.log("[Database] Connected to MySQL");
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User Profile queries
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  
  if (result.length === 0) return undefined;
  
  const profile = result[0];
  
  // Parse JSON strings back to arrays for SQLite
  return {
    ...profile,
    skills: profile.skills ? JSON.parse(profile.skills as string) : [],
    jobTitlePreferences: profile.jobTitlePreferences ? JSON.parse(profile.jobTitlePreferences as string) : [],
    targetLocations: profile.targetLocations ? JSON.parse(profile.targetLocations as string) : [],
  };
}

export async function upsertUserProfile(userId: number, profile: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Convert arrays to JSON strings for SQLite
  const profileData: any = { ...profile };
  if (profile.skills && Array.isArray(profile.skills)) {
    profileData.skills = JSON.stringify(profile.skills);
  }
  if (profile.jobTitlePreferences && Array.isArray(profile.jobTitlePreferences)) {
    profileData.jobTitlePreferences = JSON.stringify(profile.jobTitlePreferences);
  }
  if (profile.targetLocations && Array.isArray(profile.targetLocations)) {
    profileData.targetLocations = JSON.stringify(profile.targetLocations);
  }
  
  const existing = await getUserProfile(userId);
  
  if (existing) {
    return await db.update(userProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  } else {
    return await db.insert(userProfiles).values({
      userId,
      ...profileData,
    });
  }
}

// Job queries
export async function getJobsByUserId(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobs)
    .where(eq(jobs.userId, userId))
    .limit(limit)
    .offset(offset);
}

export async function getRecentJobs(userId: number, hoursBack: number = 48) {
  const db = await getDb();
  if (!db) return [];
  const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return await db.select().from(jobs)
    .where(eq(jobs.userId, userId));
}

export async function insertJob(job: InsertJob) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(jobs).values(job);
}

// Application queries
export async function getApplicationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.userId, userId));
}

export async function getApplicationByJobId(userId: number, jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications)
    .where(eq(applications.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertApplication(userId: number, jobId: number, status: string) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getApplicationByJobId(userId, jobId);
  
  if (existing) {
    return await db.update(applications)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(applications.id, existing.id));
  } else {
    return await db.insert(applications).values({
      userId,
      jobId,
      status: status as any,
    });
  }
}

// Recruiter queries
export async function getRecruiterByJobId(jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(recruiters).where(eq(recruiters.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertRecruiter(recruiter: InsertRecruiter) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(recruiters).values(recruiter);
}

// Cover Letter queries
export async function getCoverLetterByJobId(userId: number, jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coverLetters)
    .where(eq(coverLetters.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCoverLetter(userId: number, jobId: number, content: string) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getCoverLetterByJobId(userId, jobId);
  
  if (existing) {
    return await db.update(coverLetters)
      .set({ content, updatedAt: new Date() })
      .where(eq(coverLetters.id, existing.id));
  } else {
    return await db.insert(coverLetters).values({
      userId,
      jobId,
      content,
    });
  }
}
