import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Detect database type from connection string
const isSQLite = connectionString.startsWith("sqlite:") || connectionString.startsWith("file:");
const dialect = isSQLite ? "sqlite" : "mysql";

// For SQLite, convert to file: format for drizzle-kit
const dbUrl = isSQLite 
  ? connectionString.replace("sqlite:", "file:")
  : connectionString;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: dialect as "sqlite" | "mysql",
  dbCredentials: isSQLite
    ? { url: dbUrl }
    : { url: dbUrl },
});
