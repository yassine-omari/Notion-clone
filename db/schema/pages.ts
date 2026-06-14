import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'

export const pages = pgTable('pages', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    title: text('title').notNull().default('Untitled'),
    emoji: text('emoji'),
    content: jsonb('content'),
    inTrash: boolean('in_trash').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})