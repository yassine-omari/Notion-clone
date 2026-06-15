'use server'

import { db } from '@/lib/db'
import { workspaces, pages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser, getOwnedWorkspace, getOwnedPage } from '@/lib/auth'

function revalidateApp() {
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
}

export async function getWorkspaces() {
    const user = await getAuthenticatedUser()
    if (!user) return []

    return await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.userId, user.id))
}

export async function createWorkspace(title: string) {
    const user = await getAuthenticatedUser()
    if (!user) throw new Error('Unauthorized')

    await db.insert(workspaces).values({
        userId: user.id,
        title,
    })

    revalidateApp()
}

export async function getPages(workspaceId: string) {
    const workspace = await getOwnedWorkspace(workspaceId)
    if (!workspace) return []

    return await db
        .select()
        .from(pages)
        .where(eq(pages.workspaceId, workspaceId))
}

export async function createPage(workspaceId: string, title: string = 'Untitled') {
    const workspace = await getOwnedWorkspace(workspaceId)
    if (!workspace) throw new Error('Unauthorized')

    const [page] = await db.insert(pages).values({
        workspaceId,
        title,
        content: [],
    }).returning()

    revalidateApp()
    return page
}

export async function renamePage(pageId: string, title: string) {
    const owned = await getOwnedPage(pageId)
    if (!owned) throw new Error('Unauthorized')

    await db
        .update(pages)
        .set({ title })
        .where(eq(pages.id, pageId))

    revalidateApp()
}

export async function renameWorkspace(workspaceId: string, title: string) {
    const workspace = await getOwnedWorkspace(workspaceId)
    if (!workspace) throw new Error('Unauthorized')

    await db
        .update(workspaces)
        .set({ title })
        .where(eq(workspaces.id, workspaceId))

    revalidateApp()
}

export async function deletePage(pageId: string) {
    const owned = await getOwnedPage(pageId)
    if (!owned) throw new Error('Unauthorized')

    await db
        .delete(pages)
        .where(eq(pages.id, pageId))

    revalidateApp()
}

export async function deleteWorkspace(workspaceId: string) {
    const workspace = await getOwnedWorkspace(workspaceId)
    if (!workspace) throw new Error('Unauthorized')

    await db
        .delete(workspaces)
        .where(eq(workspaces.id, workspaceId))

    revalidateApp()
}
