CREATE TABLE `temporary_google_profiles` (
	`token` varchar(36) NOT NULL,
	`profile_data` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `temporary_google_profiles_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `isAdmin` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `userStatus` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `logins` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `otp` text;--> statement-breakpoint
ALTER TABLE `users` ADD `recoveryString` text;