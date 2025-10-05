CREATE TABLE `financial_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`expenses` integer NOT NULL,
	`marketing` integer NOT NULL,
	`total_revenue` integer NOT NULL,
	`profit` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_website` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_linkedin` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_twitter` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_facebook` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_instagram` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_youtube` text;--> statement-breakpoint
ALTER TABLE `corporation_info` ADD `company_reddit` text;