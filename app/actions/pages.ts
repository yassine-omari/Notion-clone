'use server'

import { db } from '@/lib/db'
import { pages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Block } from '@/types/editor'

export async function savePageContent(pageId: string, blocks: Block[]) {
    await db
        .update(pages)
        .set({ content: blocks })
        .where(eq(pages.id, pageId))
}