CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`job_id` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`applied_at` integer,
	`notes` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `cover_letters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`job_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`location` text,
	`description` text,
	`requirements` text,
	`url` text NOT NULL,
	`platform` text NOT NULL,
	`relevance_score` text,
	`match_breakdown` text,
	`scraped_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `recruiters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`name` text,
	`email` text,
	`linkedin_url` text,
	`phone` text,
	`company` text,
	`title` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`resume_text` text,
	`resume_url` text,
	`skills` text,
	`job_title_preferences` text,
	`target_locations` text,
	`years_of_experience` integer,
	`current_job_title` text,
	`notification_threshold` text DEFAULT '0.70',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`open_id` text NOT NULL,
	`name` text,
	`email` text,
	`avatar_url` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_open_id_unique` ON `users` (`open_id`);