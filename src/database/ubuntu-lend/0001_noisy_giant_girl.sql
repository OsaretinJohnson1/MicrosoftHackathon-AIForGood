ALTER TABLE `loan_types` DROP INDEX `loan_types_name_unique`;--> statement-breakpoint
ALTER TABLE `applications` DROP FOREIGN KEY `fk_application_user`;
--> statement-breakpoint
ALTER TABLE `transactions` DROP FOREIGN KEY `fk_transaction_user`;
--> statement-breakpoint
ALTER TABLE `transactions` DROP FOREIGN KEY `fk_transaction_application`;
--> statement-breakpoint
ALTER TABLE `loan_types` ADD CONSTRAINT `name_active_idx` UNIQUE(`name`,`active`);--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `fk_application_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transaction_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transaction_application` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;