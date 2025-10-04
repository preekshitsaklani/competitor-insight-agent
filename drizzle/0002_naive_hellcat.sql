ALTER TABLE `insights` ADD `labels` text;--> statement-breakpoint
ALTER TABLE `insights` ADD `public_opinion_positive` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `insights` ADD `public_opinion_negative` integer DEFAULT 0;