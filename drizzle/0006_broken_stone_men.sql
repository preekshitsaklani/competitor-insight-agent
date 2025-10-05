CREATE TABLE `user_sentiment_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`scraped_at` integer NOT NULL,
	`positive_percentage` integer DEFAULT 0 NOT NULL,
	`neutral_percentage` integer DEFAULT 0 NOT NULL,
	`negative_percentage` integer DEFAULT 0 NOT NULL,
	`positive_summary` text,
	`neutral_summary` text,
	`negative_summary` text,
	`raw_comments` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
