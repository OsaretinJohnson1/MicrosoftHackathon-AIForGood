import { mysqlTable, primaryKey, int, text, date, datetime, unique, varchar, decimal, index, foreignKey } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

// Define user roles for permission control
export const userRoles = mysqlTable("user_roles", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull().unique(),
	description: text(),
	permissions: text(), // JSON string of permissions
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Users table with improved fields
export const users = mysqlTable("users", {
	id: int().autoincrement().primaryKey().notNull(),
	firstname: varchar({ length: 255 }).notNull(),
	lastname: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	phone: varchar({ length: 20 }).notNull(),
	idNumber: varchar({ length: 13 }).notNull().unique(),
	password: varchar({ length: 255 }),
	roleId: int().default(2), // Default to regular user, 1 would be admin
	activated: int().default(0).notNull(),
	verified: int().default(0).notNull(),
	signupDate: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	addedBy: int().default(0),
	isAdmin: int().default(0),
	bankDetails: text(),
	profilePic: text(),
	address: text(),
	city: varchar({ length: 100 }),
	postalCode: varchar({ length: 20 }),
	state: varchar({ length: 100 }),
	country: varchar({ length: 100 }),
	employer: varchar({ length: 255 }),
	otp: text(),
	recoveryString: text(),
	deleted: int().default(0).notNull(),
	logins: int().default(0).notNull(),
	lastLogin: datetime({ mode: 'string' }),
	confirmationPin: text(),
	passRecString: text(),
	// 1 = deleted, 0 = active
	delStatus: int().default(0),
	// 1 admin, 0 user
	userStatus: int().default(0),
	// Add demographic data for dashboard analytics
	ageGroup: varchar({ length: 20 }),
	gender: varchar({ length: 10 }),
	occupation: varchar({ length: 100 }),
	incomeLevel: varchar({ length: 50 }),
	creditScore: int(),
}, (table) => {
	return {
		idUnique: unique("id_UNIQUE").on(table.id),
		emailIdx: index("email_idx").on(table.email),
		roleIdIdx: index("role_id_idx").on(table.roleId),
	}
});

// Loan types table for categorization
export const loanTypes = mysqlTable("loan_types", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	minAmount: decimal({ precision: 10, scale: 2 }),
	maxAmount: decimal({ precision: 10, scale: 2 }),
	minTermMonths: int(),
	maxTermMonths: int(),
	baseInterestRate: decimal({ precision: 5, scale: 2 }),
	processingFeePercent: decimal({ precision: 5, scale: 2 }),
	active: int().default(1).notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		nameUnique: unique("name_unique_idx").on(table.name),
	}
});

// Loan applications table
export const applications = mysqlTable("applications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	loanAmount: decimal({ precision: 10, scale: 2 }).notNull(),
	loanTermMonths: int().notNull(),
	interestRate: decimal({ precision: 5, scale: 2 }).notNull(),
	loanTypeId: int().default(1), // Made nullable with default value 1 to handle existing data
	purpose: varchar({ length: 255 }),
	workAddress: text(),
	employer: varchar({length: 255}).notNull(),
	employmentType: varchar({ length: 50 }), // Full-time, part-time, contract, etc.
	accountNumber: varchar({ length: 50 }),
	accountName: varchar({length: 50}).notNull(),
	accountType: varchar({ length: 30 }),
	bankName: varchar({ length: 100 }),
	payDate: date("pay_date").notNull(),
	paymentSchedule: varchar({ length: 20 }).notNull(), // Monthly, bi-weekly, weekly
	applicationDate: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	approvedBy: int(),
	approvedDate: datetime({ mode: 'string' }),
	status: varchar({ length: 50 }).default("pending").notNull(), // pending, processing, approved, rejected, disbursed, completed, defaulted
	rejectionReason: text(),
	documents: text(), // JSON string of document URLs
	notes: text(),
	// Calculated fields
	monthlyPayment: decimal({ precision: 10, scale: 2 }),
	totalPayable: decimal({ precision: 10, scale: 2 }),
	totalInterest: decimal({ precision: 10, scale: 2 }),
	nextPaymentDate: date(),
	remainingBalance: decimal({ precision: 10, scale: 2 }),
	// For dashboard tracking
	isDisbursed: int().default(0).notNull(),
	disbursementDate: datetime({ mode: 'string' }),
	isOverdue: int().default(0).notNull(),
	overdueAmount: decimal({ precision: 10, scale: 2 }),
	overdueDate: datetime({ mode: 'string' }),
}, (table) => {
	return {
		applicationsId: primaryKey({ columns: [table.id], name: "applications_id"}),
		userIdIdx: index("user_id_idx").on(table.userId),
		statusIdx: index("status_idx").on(table.status),
		loanTypeIdx: index("loan_type_idx").on(table.loanTypeId),
		// Reference to users table with cascade delete
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_application_user"
		}).onDelete("cascade"),
		// Reference to loan types table
		loanTypeFk: foreignKey({
			columns: [table.loanTypeId],
			foreignColumns: [loanTypes.id],
			name: "fk_application_loan_type"
		})
	}
});

// Transactions table with comprehensive fields
export const transactions = mysqlTable("transactions", {
	id: int().autoincrement().primaryKey().notNull(),
	transactionId: varchar({ length: 20 }).notNull().unique(), // TRX-XXXX format
	userId: int().notNull(),
	applicationId: int().notNull(),
	transactionType: varchar({ length: 50 }).notNull(), // Disbursement, Repayment, Fee, Penalty
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	paymentMethod: varchar({ length: 50 }), // Bank transfer, Cash, Mobile money, etc.
	transactionDate: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 20 }).default("completed").notNull(), // pending, completed, failed, reversed
	description: text(),
	reference: varchar({ length: 100 }), // External reference number
	balanceAfter: decimal({ precision: 10, scale: 2 }),
	createdBy: int(), // ID of admin who recorded the transaction
	attachments: text(), // JSON string of attachment URLs
	metadata: text(), // Additional JSON data if needed
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		transactionIdUnique: unique("transaction_id_UNIQUE").on(table.id),
		userIdIdx: index("transaction_user_id_idx").on(table.userId),
		applicationIdIdx: index("transaction_application_id_idx").on(table.applicationId),
		statusIdx: index("transaction_status_idx").on(table.status),
		typeIdx: index("transaction_type_idx").on(table.transactionType),
		// Reference to users table with cascade delete
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_transaction_user"
		}).onDelete("cascade"),
		// Reference to applications table with cascade delete
		applicationFk: foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "fk_transaction_application"
		}).onDelete("cascade")
	}
});

// Dashboard metrics table for performance tracking
export const dashboardMetrics = mysqlTable("dashboard_metrics", {
	id: int().autoincrement().primaryKey().notNull(),
	metricDate: date().notNull(),
	totalLoansAmount: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	totalLoansCount: int().default(0).notNull(),
	activeLoansAmount: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	activeLoansCount: int().default(0).notNull(),
	pendingApplicationsCount: int().default(0).notNull(),
	rejectedLoansCount: int().default(0).notNull(),
	disbursedAmountDaily: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	repaymentAmountDaily: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	newCustomersCount: int().default(0).notNull(),
	overdueLoansCount: int().default(0).notNull(),
	overdueLoansAmount: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		metricDateIdx: index("metric_date_idx").on(table.metricDate),
	}
});

// Loan performance by loan type for analytics
export const loanTypePerformance = mysqlTable("loan_type_performance", {
	id: int().autoincrement().primaryKey().notNull(),
	loanTypeId: int().notNull(),
	reportDate: date().notNull(),
	totalCount: int().default(0).notNull(),
	totalAmount: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	percentageShare: decimal({ precision: 5, scale: 2 }).default("0.00").notNull(),
	averageInterestRate: decimal({ precision: 5, scale: 2 }).default("0.00"),
	averageLoanAmount: decimal({ precision: 10, scale: 2 }).default("0.00"),
	defaultRate: decimal({ precision: 5, scale: 2 }).default("0.00"),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		loanTypeIdIdx: index("loan_type_perf_id_idx").on(table.loanTypeId),
		reportDateIdx: index("loan_type_report_date_idx").on(table.reportDate),
		// Reference to loan types table
		loanTypeFk: foreignKey({
			columns: [table.loanTypeId],
			foreignColumns: [loanTypes.id],
			name: "fk_loan_perf_loan_type"
		})
	}
});

// Loan status distribution for dashboard
export const loanStatusDistribution = mysqlTable("loan_status_distribution", {
	id: int().autoincrement().primaryKey().notNull(),
	reportDate: date().notNull(),
	status: varchar({ length: 50 }).notNull(),
	count: int().default(0).notNull(),
	amount: decimal({ precision: 15, scale: 2 }).default("0.00").notNull(),
	percentageShare: decimal({ precision: 5, scale: 2 }).default("0.00").notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		reportDateIdx: index("status_report_date_idx").on(table.reportDate),
		statusIdx: index("status_idx").on(table.status),
	}
});

// Customer details table for additional customer information
export const customerDetails = mysqlTable("customer_details", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	company: varchar({ length: 255 }),
	address: text(),
	creditLimit: decimal({ precision: 10, scale: 2 }),
	joinDate: date(),
	tags: text(),
	notes: text(),
	status: varchar({ length: 50 }).default("Active").notNull(), // Active, Inactive, Pending
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		userIdIdx: index("customer_user_id_idx").on(table.userId),
		statusIdx: index("customer_status_idx").on(table.status),
		// Reference to users table with cascade delete
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_customer_user"
		}).onDelete("cascade")
	}
});

export const temporaryGoogleProfiles = mysqlTable("temporary_google_profiles", {
  token: varchar("token", { length: 36 }).primaryKey(), // UUID as token
  profileData: text("profile_data").notNull(), // JSON string of Google profile
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(), // For expiration tracking
});