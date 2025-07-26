import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import * as authSchema from '../../../auth-schema';

export const users = authSchema.user;
export const sessions = authSchema.session;
export const accounts = authSchema.account;
export const verifications = authSchema.verification;

// Credit system table
export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  featureUsed: varchar('feature_used', { length: 20 }).notNull(), // 'interior', 'exterior', 'sketch', 'furnish', 'remove', 'video', 'text'
  creditsConsumed: integer('credits_consumed').default(1).notNull(),
  generationId: text('generation_id'), // Link to specific generation
  metadata: jsonb('metadata'), // Additional data like prompt, settings, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Application tables
export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  originalImageUrl: text('original_image_url').notNull(),
  generatedImageUrl: text('generated_image_url'),
  roomType: varchar('room_type', { length: 50 }),
  style: varchar('style', { length: 50 }),
  aiPromptUsed: text('ai_prompt_used'),
  resolution: varchar('resolution', { length: 10 }).default('4K'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  imageId: uuid('image_id').references(() => images.id),
  originalImageUrl: text('original_image_url').notNull(),
  generatedVideoUrl: text('generated_video_url'),
  thumbnailUrl: text('thumbnail_url'),
  effect: varchar('effect', { length: 50 }).notNull(), // 'rotate180', 'zoomIn', 'zoomOut'
  lumaGenerationId: text('luma_generation_id'),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  aiPromptUsed: text('ai_prompt_used'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const imageStorage = pgTable('image_storage', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageData: text('image_data').notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  imageId: uuid('image_id').references(() => images.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type ImageStorage = typeof imageStorage.$inferSelect;
export type NewImageStorage = typeof imageStorage.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
