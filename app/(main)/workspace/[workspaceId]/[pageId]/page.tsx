import { redirect } from 'next/navigation'
import { parseBlocks } from '@/lib/blocks'
import { getOwnedPage } from '@/lib/auth'
import EditorWrapper from '@/components/editor/editor-wrapper'

type Props = {
    params: Promise<{ workspaceId: string; pageId: string }>
}

export default async function PageEditor({ params }: Props) {
    const { workspaceId, pageId } = await params

    const owned = await getOwnedPage(pageId)
    if (!owned) redirect('/dashboard')

    const { page } = owned
    if (page.workspaceId !== workspaceId) redirect('/dashboard')

    const initialBlocks = parseBlocks(page.content)

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: 'radial-gradient(circle, #d1d5db 0.8px, transparent 0.8px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="border-b border-gray-200 bg-white/70 backdrop-blur-sm px-12 py-3 text-sm text-gray-400 font-medium tracking-wide sticky top-0">
                {page.title}
            </div>
            <EditorWrapper
                pageId={pageId}
                initialBlocks={initialBlocks}
            />
        </div>
    )
}
