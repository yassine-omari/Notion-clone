import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { workspaces, pages } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAuthenticatedUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getOwnedWorkspace(workspaceId: string) {
    const user = await getAuthenticatedUser()
    if (!user) return null

    const [workspace] = await db
        .select()
        .from(workspaces)
        .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, user.id)))

    return workspace ?? null
}

export async function getOwnedPage(pageId: string) {
    const user = await getAuthenticatedUser()
    if (!user) return null

    const [result] = await db
        .select({ page: pages, workspace: workspaces })
        .from(pages)
        .innerJoin(workspaces, eq(pages.workspaceId, workspaces.id))
        .where(and(eq(pages.id, pageId), eq(workspaces.userId, user.id)))

    if (!result) return null
    return { page: result.page, workspace: result.workspace }
}
