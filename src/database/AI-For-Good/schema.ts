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
	phone: varchar({ length: 20 }),
	password: varchar({ length: 255 }),
	roleId: int().default(2), // Default to regular user, 1 would be admin
	activated: int().default(1).notNull(),
	verified: int().default(0).notNull(),
	signupDate: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	profilePic: text(),
	region: varchar({ length: 100 }),
	country: varchar({ length: 100 }),
	preferredLanguage: varchar({ length: 50 }),
	bio: text(),
	lastLogin: datetime({ mode: 'string' }),
	deletedAt: datetime({ mode: 'string' }),
	// Fields needed for auth.ts
	isAdmin: int().default(0).notNull(), // 1 admin, 0 user
	userStatus: int().default(0).notNull(), // User status
	logins: int().default(0).notNull(), // Number of times user has logged in
	otp: text(), // One-time password for verification
	recoveryString: text(), // For password recovery
}, (table) => {
	return {
		idUnique: unique("id_UNIQUE").on(table.id),
		emailIdx: index("email_idx").on(table.email),
		roleIdIdx: index("role_id_idx").on(table.roleId),
		roleIdFk: foreignKey({
			columns: [table.roleId],
			foreignColumns: [userRoles.id],
			name: "fk_user_role"
		})
	}
});

// Temporary storage for Google profiles during sign-up
export const temporaryGoogleProfiles = mysqlTable("temporary_google_profiles", {
	token: varchar("token", { length: 36 }).primaryKey(), // UUID as token
	profileData: text("profile_data").notNull(), // JSON string of Google profile
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(), // For expiration tracking
});

// Languages table for supported languages
export const languages = mysqlTable("languages", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 10 }).notNull().unique(),
	isActive: int().default(1).notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Stories table for original submissions
export const stories = mysqlTable("stories", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	originalContent: text().notNull(),
	originalLanguageId: int().notNull(),
	audioRecordingUrl: text(),
	description: text(),
	tags: text(), // JSON array of cultural tags
	location: varchar({ length: 255 }), // Geographic origin of the story
	isPublic: int().default(1).notNull(),
	views: int().default(0).notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		userIdIdx: index("story_user_id_idx").on(table.userId),
		languageIdIdx: index("story_language_id_idx").on(table.originalLanguageId),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_story_user"
		}).onDelete("cascade"),
		languageFk: foreignKey({
			columns: [table.originalLanguageId],
			foreignColumns: [languages.id],
			name: "fk_story_language"
		})
	}
});

// Story translations
export const storyTranslations = mysqlTable("story_translations", {
	id: int().autoincrement().primaryKey().notNull(),
	storyId: int().notNull(),
	languageId: int().notNull(),
	translatedContent: text().notNull(),
	translationType: varchar({ length: 20 }).notNull(), // AI or Human
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		storyIdIdx: index("translation_story_id_idx").on(table.storyId),
		languageIdIdx: index("translation_language_id_idx").on(table.languageId),
		uniqueTranslation: unique("unique_story_language").on(table.storyId, table.languageId),
		storyFk: foreignKey({
			columns: [table.storyId],
			foreignColumns: [stories.id],
			name: "fk_translation_story"
		}).onDelete("cascade"),
		languageFk: foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: "fk_translation_language"
		})
	}
});

// Comics table for generated comics
export const comics = mysqlTable("comics", {
	id: int().autoincrement().primaryKey().notNull(),
	storyId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	panelCount: int().notNull(),
	status: varchar({ length: 20 }).default("processing").notNull(), // processing, completed, failed
	generationPrompt: text(), // The system prompt used for generation
	thumbnailUrl: text(),
	views: int().default(0).notNull(),
	likes: int().default(0).notNull(),
	shares: int().default(0).notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		storyIdIdx: index("comic_story_id_idx").on(table.storyId),
		statusIdx: index("comic_status_idx").on(table.status),
		storyFk: foreignKey({
			columns: [table.storyId],
			foreignColumns: [stories.id],
			name: "fk_comic_story"
		}).onDelete("cascade")
	}
});

// Comic panels
export const comicPanels = mysqlTable("comic_panels", {
	id: int().autoincrement().primaryKey().notNull(),
	comicId: int().notNull(),
	panelNumber: int().notNull(),
	imageUrl: text().notNull(),
	caption: text(),
	altText: text(),
	promptUsed: text(), // The specific prompt used for this panel
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		comicIdIdx: index("panel_comic_id_idx").on(table.comicId),
		uniquePanel: unique("unique_comic_panel").on(table.comicId, table.panelNumber),
		comicFk: foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "fk_panel_comic"
		}).onDelete("cascade")
	}
});

// User favorites/bookmarks
export const userFavorites = mysqlTable("user_favorites", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	comicId: int().notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		userIdIdx: index("favorite_user_id_idx").on(table.userId),
		comicIdIdx: index("favorite_comic_id_idx").on(table.comicId),
		uniqueFavorite: unique("unique_user_comic").on(table.userId, table.comicId),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_favorite_user"
		}).onDelete("cascade"),
		comicFk: foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "fk_favorite_comic"
		}).onDelete("cascade")
	}
});

// User comments on comics
export const comments = mysqlTable("comments", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	comicId: int().notNull(),
	content: text().notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		userIdIdx: index("comment_user_id_idx").on(table.userId),
		comicIdIdx: index("comment_comic_id_idx").on(table.comicId),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_comment_user"
		}).onDelete("cascade"),
		comicFk: foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "fk_comment_comic"
		}).onDelete("cascade")
	}
});

// Cultural metadata tags
export const culturalTags = mysqlTable("cultural_tags", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull().unique(),
	description: text(),
	category: varchar({ length: 50 }), // e.g., "tribe", "tradition", "region"
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Story-tag relationship (many-to-many)
export const storyTags = mysqlTable("story_tags", {
	id: int().autoincrement().primaryKey().notNull(),
	storyId: int().notNull(),
	tagId: int().notNull(),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		storyIdIdx: index("story_tag_story_id_idx").on(table.storyId),
		tagIdIdx: index("story_tag_tag_id_idx").on(table.tagId),
		uniqueStoryTag: unique("unique_story_tag").on(table.storyId, table.tagId),
		storyFk: foreignKey({
			columns: [table.storyId],
			foreignColumns: [stories.id],
			name: "fk_story_tag_story"
		}).onDelete("cascade"),
		tagFk: foreignKey({
			columns: [table.tagId],
			foreignColumns: [culturalTags.id],
			name: "fk_story_tag_tag"
		}).onDelete("cascade")
	}
});

// Audio narrations for comics
export const audioNarrations = mysqlTable("audio_narrations", {
	id: int().autoincrement().primaryKey().notNull(),
	comicId: int().notNull(),
	languageId: int().notNull(),
	audioUrl: text().notNull(),
	duration: int(), // in seconds
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		comicIdIdx: index("narration_comic_id_idx").on(table.comicId),
		languageIdIdx: index("narration_language_id_idx").on(table.languageId),
		uniqueNarration: unique("unique_comic_language_narration").on(table.comicId, table.languageId),
		comicFk: foreignKey({
			columns: [table.comicId],
			foreignColumns: [comics.id],
			name: "fk_narration_comic"
		}).onDelete("cascade"),
		languageFk: foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: "fk_narration_language"
		})
	}
});

// Cultural insights/AI explanations for story elements
export const culturalInsights = mysqlTable("cultural_insights", {
	id: int().autoincrement().primaryKey().notNull(),
	storyId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	sourceType: varchar({ length: 20 }).notNull(), // AI-generated or expert-provided
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		storyIdIdx: index("insight_story_id_idx").on(table.storyId),
		storyFk: foreignKey({
			columns: [table.storyId],
			foreignColumns: [stories.id],
			name: "fk_insight_story"
		}).onDelete("cascade")
	}
});

// Analytics for tracking platform usage
export const analyticsEvents = mysqlTable("analytics_events", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int(),
	eventType: varchar({ length: 50 }).notNull(), // view, create, share, etc.
	resourceType: varchar({ length: 50 }).notNull(), // story, comic, etc.
	resourceId: int(),
	metadata: text(), // JSON string with additional event data
	userAgent: text(),
	ipAddress: varchar({ length: 45 }),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
	return {
		userIdIdx: index("analytics_user_id_idx").on(table.userId),
		eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
		resourceTypeIdx: index("analytics_resource_type_idx").on(table.resourceType),
		createdAtIdx: index("analytics_created_at_idx").on(table.createdAt),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_analytics_user"
		}).onDelete("set null")
	}
});

// OAuth connections for social logins (Google, Facebook, GitHub)
export const oauthConnections = mysqlTable("oauth_connections", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	provider: varchar({ length: 50 }).notNull(), // google, facebook, github, etc.
	providerId: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	createdAt: datetime({ mode: 'string' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	lastUsed: datetime({ mode: 'string' }),
}, (table) => {
	return {
		userIdIdx: index("oauth_user_id_idx").on(table.userId),
		providerIdx: index("oauth_provider_idx").on(table.provider),
		uniqueProviderConnection: unique("unique_provider_id").on(table.provider, table.providerId),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_oauth_user"
		}).onDelete("cascade")
	}
});