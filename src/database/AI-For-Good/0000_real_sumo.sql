CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(50) NOT NULL,
	`resourceType` varchar(50) NOT NULL,
	`resourceId` int,
	`metadata` text,
	`userAgent` text,
	`ipAddress` varchar(45),
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audio_narrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comicId` int NOT NULL,
	`languageId` int NOT NULL,
	`audioUrl` text NOT NULL,
	`duration` int,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audio_narrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_comic_language_narration` UNIQUE(`comicId`,`languageId`)
);
--> statement-breakpoint
CREATE TABLE `comic_panels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comicId` int NOT NULL,
	`panelNumber` int NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` text,
	`altText` text,
	`promptUsed` text,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `comic_panels_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_comic_panel` UNIQUE(`comicId`,`panelNumber`)
);
--> statement-breakpoint
CREATE TABLE `comics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`panelCount` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'processing',
	`generationPrompt` text,
	`thumbnailUrl` text,
	`views` int NOT NULL DEFAULT 0,
	`likes` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`comicId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cultural_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`sourceType` varchar(20) NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cultural_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cultural_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(50),
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `cultural_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `cultural_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(10) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `languages_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `oauth_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`providerId` varchar(255) NOT NULL,
	`email` varchar(255),
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`lastUsed` datetime,
	CONSTRAINT `oauth_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_provider_id` UNIQUE(`provider`,`providerId`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`originalContent` text NOT NULL,
	`originalLanguageId` int NOT NULL,
	`audioRecordingUrl` text,
	`description` text,
	`tags` text,
	`location` varchar(255),
	`isPublic` int NOT NULL DEFAULT 1,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `story_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_story_tag` UNIQUE(`storyId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `story_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`languageId` int NOT NULL,
	`translatedContent` text NOT NULL,
	`translationType` varchar(20) NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `story_translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_story_language` UNIQUE(`storyId`,`languageId`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`comicId` int NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_comic` UNIQUE(`userId`,`comicId`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`permissions` text,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstname` varchar(255) NOT NULL,
	`lastname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`roleId` int DEFAULT 2,
	`activated` int NOT NULL DEFAULT 1,
	`verified` int NOT NULL DEFAULT 0,
	`signupDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`profilePic` text,
	`region` varchar(100),
	`country` varchar(100),
	`preferredLanguage` varchar(50),
	`bio` text,
	`lastLogin` datetime,
	`deletedAt` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `id_UNIQUE` UNIQUE(`id`)
);
--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `fk_analytics_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audio_narrations` ADD CONSTRAINT `fk_narration_comic` FOREIGN KEY (`comicId`) REFERENCES `comics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audio_narrations` ADD CONSTRAINT `fk_narration_language` FOREIGN KEY (`languageId`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comic_panels` ADD CONSTRAINT `fk_panel_comic` FOREIGN KEY (`comicId`) REFERENCES `comics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comics` ADD CONSTRAINT `fk_comic_story` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `fk_comment_comic` FOREIGN KEY (`comicId`) REFERENCES `comics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cultural_insights` ADD CONSTRAINT `fk_insight_story` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_connections` ADD CONSTRAINT `fk_oauth_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `fk_story_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `fk_story_language` FOREIGN KEY (`originalLanguageId`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_tags` ADD CONSTRAINT `fk_story_tag_story` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_tags` ADD CONSTRAINT `fk_story_tag_tag` FOREIGN KEY (`tagId`) REFERENCES `cultural_tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_translations` ADD CONSTRAINT `fk_translation_story` FOREIGN KEY (`storyId`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_translations` ADD CONSTRAINT `fk_translation_language` FOREIGN KEY (`languageId`) REFERENCES `languages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_favorites` ADD CONSTRAINT `fk_favorite_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_favorites` ADD CONSTRAINT `fk_favorite_comic` FOREIGN KEY (`comicId`) REFERENCES `comics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`roleId`) REFERENCES `user_roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analytics_user_id_idx` ON `analytics_events` (`userId`);--> statement-breakpoint
CREATE INDEX `analytics_event_type_idx` ON `analytics_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `analytics_resource_type_idx` ON `analytics_events` (`resourceType`);--> statement-breakpoint
CREATE INDEX `analytics_created_at_idx` ON `analytics_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `narration_comic_id_idx` ON `audio_narrations` (`comicId`);--> statement-breakpoint
CREATE INDEX `narration_language_id_idx` ON `audio_narrations` (`languageId`);--> statement-breakpoint
CREATE INDEX `panel_comic_id_idx` ON `comic_panels` (`comicId`);--> statement-breakpoint
CREATE INDEX `comic_story_id_idx` ON `comics` (`storyId`);--> statement-breakpoint
CREATE INDEX `comic_status_idx` ON `comics` (`status`);--> statement-breakpoint
CREATE INDEX `comment_user_id_idx` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `comment_comic_id_idx` ON `comments` (`comicId`);--> statement-breakpoint
CREATE INDEX `insight_story_id_idx` ON `cultural_insights` (`storyId`);--> statement-breakpoint
CREATE INDEX `oauth_user_id_idx` ON `oauth_connections` (`userId`);--> statement-breakpoint
CREATE INDEX `oauth_provider_idx` ON `oauth_connections` (`provider`);--> statement-breakpoint
CREATE INDEX `story_user_id_idx` ON `stories` (`userId`);--> statement-breakpoint
CREATE INDEX `story_language_id_idx` ON `stories` (`originalLanguageId`);--> statement-breakpoint
CREATE INDEX `story_tag_story_id_idx` ON `story_tags` (`storyId`);--> statement-breakpoint
CREATE INDEX `story_tag_tag_id_idx` ON `story_tags` (`tagId`);--> statement-breakpoint
CREATE INDEX `translation_story_id_idx` ON `story_translations` (`storyId`);--> statement-breakpoint
CREATE INDEX `translation_language_id_idx` ON `story_translations` (`languageId`);--> statement-breakpoint
CREATE INDEX `favorite_user_id_idx` ON `user_favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `favorite_comic_id_idx` ON `user_favorites` (`comicId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `users` (`roleId`);