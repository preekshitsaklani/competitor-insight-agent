CREATE TABLE `competitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`website_url` text,
	`logo_url` text,
	`industry` text,
	`status` text DEFAULT 'active' NOT NULL,
	`monitoring_frequency` text DEFAULT 'daily' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`competitor_id` integer NOT NULL,
	`platform` text,
	`content` text,
	`summary` text,
	`insight_type` text NOT NULL,
	`sentiment` text NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`key_points` text,
	`recommendations` text,
	`impact` text,
	`tags` text,
	`public_opinion` text,
	`source_url` text,
	`detected_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competitor_id` integer NOT NULL,
	`platform` text NOT NULL,
	`handle` text NOT NULL,
	`url` text,
	`is_active` integer DEFAULT true,
	`created_at` text NOT NULL,
	FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`email_enabled` integer DEFAULT true,
	`email_frequency` text DEFAULT 'daily' NOT NULL,
	`slack_enabled` integer DEFAULT false,
	`slack_webhook_url` text,
	`preferred_delivery_time` text DEFAULT '09:00',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);