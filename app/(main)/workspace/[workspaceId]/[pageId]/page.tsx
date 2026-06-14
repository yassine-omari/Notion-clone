import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { pages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Block } from '@/types/editor'
import EditorWrapper from '@/components/editor/editor-wrapper'

type Props = {
    params: Promise<{ workspaceId: string; pageId: string }>
}

export default async function PageEditor({ params }: Props) {
    const { workspaceId, pageId } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, pageId))

    if (!page) redirect(`/workspace/${workspaceId}`)

    const initialBlocks: Block[] = (page.content as Block[]) || []

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b px-8 py-3 text-sm text-gray-500">
                {page.title}
            </div>
            <EditorWrapper
                pageId={pageId}
                initialBlocks={initialBlocks}
            />
        </div>
    )
}