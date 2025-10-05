ALTER TABLE `user` ADD `totp_secret` text;--> statement-breakpoint
ALTER TABLE `user` ADD `totp_enabled` integer DEFAULT false;