import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  phone: text("phone"),
  companyWebsite: text("company_website"),
  profilePhotoUrl: text("profile_photo_url"),
  totpSecret: text("totp_secret"),
  totpEnabled: integer("totp_enabled", { mode: "boolean" }).default(false),
  deactivatedAt: integer("deactivated_at", { mode: "timestamp" }),
  deactivationRequestedAt: integer("deactivation_requested_at", { mode: "timestamp" }),
  deletionRequestedAt: integer("deletion_requested_at", { mode: "timestamp" }),
  deletionScheduledAt: integer("deletion_scheduled_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Aether competitive intelligence tables
export const competitors = sqliteTable('competitors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  industry: text('industry'),
  status: text('status').notNull().default('active'),
  monitoringFrequency: text('monitoring_frequency').notNull().default('daily'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const socialAccounts = sqliteTable('social_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  competitorId: integer('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  handle: text('handle').notNull(),
  url: text('url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

export const insights = sqliteTable('insights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  competitorId: integer('competitor_id').notNull().references(() => competitors.id, { onDelete: 'cascade' }),
  platform: text('platform'),
  content: text('content'),
  summary: text('summary'),
  insightType: text('insight_type').notNull(),
  sentiment: text('sentiment').notNull(),
  priority: text('priority').notNull().default('medium'),
  keyPoints: text('key_points', { mode: 'json' }),
  recommendations: text('recommendations', { mode: 'json' }),
  impact: text('impact'),
  tags: text('tags', { mode: 'json' }),
  labels: text('labels', { mode: 'json' }),
  publicOpinion: text('public_opinion', { mode: 'json' }),
  publicOpinionPositive: integer('public_opinion_positive').default(0),
  publicOpinionNegative: integer('public_opinion_negative').default(0),
  sourceUrl: text('source_url'),
  detectedAt: text('detected_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  emailEnabled: integer('email_enabled', { mode: 'boolean' }).default(true),
  emailFrequency: text('email_frequency').notNull().default('daily'),
  slackEnabled: integer('slack_enabled', { mode: 'boolean' }).default(false),
  slackWebhookUrl: text('slack_webhook_url'),
  preferredDeliveryTime: text('preferred_delivery_time').default('09:00'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const corporationInfo = sqliteTable('corporation_info', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  companySize: integer('company_size'),
  companyDescription: text('company_description'),
  industry: text('industry'),
  topEmployees: text('top_employees', { mode: 'json' }),
  companyWebsite: text('company_website'),
  companyLinkedin: text('company_linkedin'),
  companyTwitter: text('company_twitter'),
  companyFacebook: text('company_facebook'),
  companyInstagram: text('company_instagram'),
  companyYoutube: text('company_youtube'),
  companyReddit: text('company_reddit'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const financialMetrics = sqliteTable('financial_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  month: text('month').notNull(),
  expenses: integer('expenses').notNull(),
  marketing: integer('marketing').notNull(),
  totalRevenue: integer('total_revenue').notNull(),
  profit: integer('profit').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const userSentimentData = sqliteTable('user_sentiment_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  scrapedAt: integer('scraped_at', { mode: 'timestamp' }).notNull(),
  positivePercentage: integer('positive_percentage').notNull().default(0),
  neutralPercentage: integer('neutral_percentage').notNull().default(0),
  negativePercentage: integer('negative_percentage').notNull().default(0),
  positiveSummary: text('positive_summary', { mode: 'json' }),
  neutralSummary: text('neutral_summary', { mode: 'json' }),
  negativeSummary: text('negative_summary', { mode: 'json' }),
  rawComments: text('raw_comments', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});