import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  date: integer('date').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Achievements table
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: integer('unlocked_at').notNull(),
  progress: integer('progress').notNull().default(0),
  target: integer('target').notNull().default(1),
});

// Miles history table
export const milesHistory = sqliteTable('miles_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  milesEarned: integer('miles_earned').notNull(),
  reason: text('reason').notNull(),
  source: text('source').notNull(),
  createdAt: integer('created_at').notNull(),
  status: text('status').notNull().default('pending'),
  releasedAt: integer('released_at'),
});

// NGOs table
export const ngos = sqliteTable('ngos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  logoUrl: text('logo_url').notNull(),
  minMiles: integer('min_miles').notNull(),
  ods: text('ods').notNull(),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at').notNull(),
});

// Donations table
export const donations = sqliteTable('donations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  ngoId: integer('ngo_id').notNull().references(() => ngos.id),
  milesAmount: integer('miles_amount').notNull(),
  investmentValue: real('investment_value').notNull(),
  createdAt: integer('created_at').notNull(),
  status: text('status').notNull().default('active'),
});

// Fund history table
export const fundHistory = sqliteTable('fund_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'deposit' or 'return' or 'withdrawal'
  value: real('value').notNull(),
  balanceAfter: real('balance_after').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Fraud logs table
export const fraudLogs = sqliteTable('fraud_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  riskLevel: text('risk_level').notNull(),
  details: text('details').notNull(),
  createdAt: integer('created_at').notNull(),
});

// User profile table
export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  investorProfile: text('investor_profile'),
  totalMiles: integer('total_miles').notNull().default(0),
  fundBalance: real('fund_balance').notNull().default(0),
  monthlyReturn: real('monthly_return').notNull().default(0),
  lastFundUpdate: integer('last_fund_update'),
  accountCreatedAt: integer('account_created_at').notNull(),
  consistencyScore: integer('consistency_score').notNull().default(100),
  accountAge: integer('account_age').notNull().default(0),
  dailyDesistCount: integer('daily_desist_count').notNull().default(0),
  weeklyDesistCount: integer('weekly_desist_count').notNull().default(0),
  lastSavingDate: integer('last_saving_date'),
  hasBankIntegration: integer('has_bank_integration', { mode: 'boolean' }).default(false),
  totalSavings: real('total_savings').notNull().default(0),
  totalDonations: integer('total_donations').notNull().default(0),
});

// Add new savings table
export const savings = sqliteTable('savings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  amount: real('amount').notNull(),
  date: integer('date').notNull(),
  cancelled: integer('cancelled', { mode: 'boolean' }).default(false),
  milesEarned: integer('miles_earned').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Add new friends table
export const friends = sqliteTable('friends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  friendId: text('friend_id').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Add new goals table
export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').notNull().default(0),
  deadline: integer('deadline'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at').notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
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