CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loanAmount` decimal(10,2) NOT NULL,
	`loanTermMonths` int NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`loanTypeId` int DEFAULT 1,
	`purpose` varchar(255),
	`workAddress` text,
	`employer` varchar(255) NOT NULL,
	`employmentType` varchar(50),
	`accountNumber` varchar(50),
	`accountName` varchar(50) NOT NULL,
	`accountType` varchar(30),
	`bankName` varchar(100),
	`pay_date` date NOT NULL,
	`paymentSchedule` varchar(20) NOT NULL,
	`applicationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`approvedBy` int,
	`approvedDate` datetime,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`documents` text,
	`notes` text,
	`monthlyPayment` decimal(10,2),
	`totalPayable` decimal(10,2),
	`totalInterest` decimal(10,2),
	`nextPaymentDate` date,
	`remainingBalance` decimal(10,2),
	`isDisbursed` int NOT NULL DEFAULT 0,
	`disbursementDate` datetime,
	`isOverdue` int NOT NULL DEFAULT 0,
	`overdueAmount` decimal(10,2),
	`overdueDate` datetime,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricDate` date NOT NULL,
	`totalLoansAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`totalLoansCount` int NOT NULL DEFAULT 0,
	`activeLoansAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`activeLoansCount` int NOT NULL DEFAULT 0,
	`pendingApplicationsCount` int NOT NULL DEFAULT 0,
	`rejectedLoansCount` int NOT NULL DEFAULT 0,
	`disbursedAmountDaily` decimal(15,2) NOT NULL DEFAULT '0.00',
	`repaymentAmountDaily` decimal(15,2) NOT NULL DEFAULT '0.00',
	`newCustomersCount` int NOT NULL DEFAULT 0,
	`overdueLoansCount` int NOT NULL DEFAULT 0,
	`overdueLoansAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loan_status_distribution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` date NOT NULL,
	`status` varchar(50) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`percentageShare` decimal(5,2) NOT NULL DEFAULT '0.00',
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `loan_status_distribution_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loan_type_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanTypeId` int NOT NULL,
	`reportDate` date NOT NULL,
	`totalCount` int NOT NULL DEFAULT 0,
	`totalAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`percentageShare` decimal(5,2) NOT NULL DEFAULT '0.00',
	`averageInterestRate` decimal(5,2) DEFAULT '0.00',
	`averageLoanAmount` decimal(10,2) DEFAULT '0.00',
	`defaultRate` decimal(5,2) DEFAULT '0.00',
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `loan_type_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loan_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`minAmount` decimal(10,2),
	`maxAmount` decimal(10,2),
	`minTermMonths` int,
	`maxTermMonths` int,
	`baseInterestRate` decimal(5,2),
	`processingFeePercent` decimal(5,2),
	`active` int NOT NULL DEFAULT 1,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loan_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `loan_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(20) NOT NULL,
	`userId` int NOT NULL,
	`applicationId` int NOT NULL,
	`transactionType` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50),
	`transactionDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` varchar(20) NOT NULL DEFAULT 'completed',
	`description` text,
	`reference` varchar(100),
	`balanceAfter` decimal(10,2),
	`createdBy` int,
	`attachments` text,
	`metadata` text,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionId_unique` UNIQUE(`transactionId`),
	CONSTRAINT `transaction_id_UNIQUE` UNIQUE(`id`)
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
	`phone` varchar(20) NOT NULL,
	`idNumber` varchar(13) NOT NULL,
	`password` varchar(255) NOT NULL,
	`roleId` int DEFAULT 2,
	`activated` int NOT NULL DEFAULT 0,
	`verified` int NOT NULL DEFAULT 0,
	`signupDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`addedBy` int DEFAULT 0,
	`isAdmin` int DEFAULT 0,
	`bankDetails` text,
	`profilePic` text,
	`address` text,
	`city` varchar(100),
	`postalCode` varchar(20),
	`otp` text,
	`recoveryString` text,
	`deleted` int NOT NULL DEFAULT 0,
	`logins` int NOT NULL DEFAULT 0,
	`lastLogin` datetime,
	`confirmationPin` text,
	`passRecString` text,
	`delStatus` int DEFAULT 0,
	`userStatus` int DEFAULT 0,
	`ageGroup` varchar(20),
	`gender` varchar(10),
	`occupation` varchar(100),
	`incomeLevel` varchar(50),
	`creditScore` int,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_idNumber_unique` UNIQUE(`idNumber`),
	CONSTRAINT `id_UNIQUE` UNIQUE(`id`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `fk_application_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `fk_application_loan_type` FOREIGN KEY (`loanTypeId`) REFERENCES `loan_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loan_type_performance` ADD CONSTRAINT `fk_loan_perf_loan_type` FOREIGN KEY (`loanTypeId`) REFERENCES `loan_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transaction_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `fk_transaction_application` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `applications` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `loan_type_idx` ON `applications` (`loanTypeId`);--> statement-breakpoint
CREATE INDEX `metric_date_idx` ON `dashboard_metrics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `status_report_date_idx` ON `loan_status_distribution` (`reportDate`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `loan_status_distribution` (`status`);--> statement-breakpoint
CREATE INDEX `loan_type_perf_id_idx` ON `loan_type_performance` (`loanTypeId`);--> statement-breakpoint
CREATE INDEX `loan_type_report_date_idx` ON `loan_type_performance` (`reportDate`);--> statement-breakpoint
CREATE INDEX `transaction_user_id_idx` ON `transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `transaction_application_id_idx` ON `transactions` (`applicationId`);--> statement-breakpoint
CREATE INDEX `transaction_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `transaction_type_idx` ON `transactions` (`transactionType`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `users` (`roleId`);