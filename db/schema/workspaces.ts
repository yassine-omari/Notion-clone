import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    emoji: text('emoji'),
    inTrash: boolean('in_trash').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})