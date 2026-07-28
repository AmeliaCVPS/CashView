CREATE TABLE `friends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`target_amount` real NOT NULL,
	`current_amount` real DEFAULT 0 NOT NULL,
	`deadline` integer,
	`completed` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `savings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`date` integer NOT NULL,
	`cancelled` integer DEFAULT false,
	`miles_earned` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `achievements` ADD `progress` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `achievements` ADD `target` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `consistency_score` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `account_age` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `daily_desist_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `weekly_desist_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `last_saving_date` integer;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `has_bank_integration` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `total_savings` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `total_donations` integer DEFAULT 0 NOT NULL;