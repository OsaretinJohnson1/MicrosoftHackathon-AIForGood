CREATE TABLE `customer_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`company` varchar(255),
	`address` text,
	`creditLimit` decimal(10,2),
	`joinDate` date,
	`tags` text,
	`notes` text,
	`status` varchar(50) NOT NULL DEFAULT 'Active',
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loan_types` DROP INDEX `name_active_idx`;--> statement-breakpoint
ALTER TABLE `customer_details` ADD CONSTRAINT `fk_customer_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `customer_user_id_idx` ON `customer_details` (`userId`);--> statement-breakpoint
CREATE INDEX `customer_status_idx` ON `customer_details` (`status`);