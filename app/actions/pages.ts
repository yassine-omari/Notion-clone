'use server'

import { db } from '@/lib/db'
import { pages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Block } from '@/types/editor'
import { getOwnedPage } from '@/lib/auth'

export async function savePageContent(pageId: string, blocks: Block[]) {
    const owned = await getOwnedPage(pageId)
    if (!owned) throw new Error('Unauthorized')

    await db
        .update(pages)
        .set({ content: blocks })
        .where(eq(pages.id, pageId))
}
