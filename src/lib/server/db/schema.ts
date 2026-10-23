import { sql } from 'drizzle-orm';
import { pgTable, serial, integer, text, boolean, date, varchar, decimal, timestamp, uuid, check } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	/** student ID */
	id: text().notNull().primaryKey(),
	/** last name hash */
	password: text().notNull(),
	usingDefault: boolean().default(true).notNull(),
	balance: decimal({ scale: 1 }).notNull().default("0")
})

export const transaction = pgTable('transaction', {
	id: serial('id').primaryKey(),
	timestamp: timestamp().notNull().defaultNow(),
	amount: decimal({ scale: 1 }).notNull(),
	userId: text().notNull().references(() => user.id),
	reason: text()
}, (table) => [
	check("nonzero_check", sql`${table.amount} != 0`)
])

export const service = pgTable('service', {
	id: serial('id').primaryKey(),
	basePrice: decimal({scale: 1}).notNull(),
	name: text().notNull(),
	// i don't know if i should make this argon2
	authenticationKey: text().notNull(),
	wording: text({ enum: ['activation', 'redemption'] }).notNull().default("activation")
})

export const voucher = pgTable('voucher', {
	id: uuid('id').primaryKey().defaultRandom(),
	expiry: timestamp().notNull().default(sql`CURRENT_TIMESTAMP + interval '1 hour'`),
	amount: integer().notNull()
})