CREATE TABLE `corporation_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`company_size` integer,
	`company_description` text,
	`industry` text,
	`top_employees` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `corporation_info_user_id_unique` ON `corporation_info` (`user_id`);--> statement-breakpoint
ALTER TABLE `user` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `user` ADD `company_website` text;--> statement-breakpoint
ALTER TABLE `user` ADD `profile_photo_url` text;--> statement-breakpoint
ALTER TABLE `user` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `deactivation_requested_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `deletion_requested_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `deletion_scheduled_at` integer;