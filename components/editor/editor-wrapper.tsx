'use client'

import Editor from './editor'
import { Block } from '@/types/editor'
import { savePageContent } from '@/app/actions/pages'

type Props = {
    pageId: string
    initialBlocks: Block[]
}

export default function EditorWrapper({ pageId, initialBlocks }: Props) {
    async function handleSave(blocks: Block[]) {
        await savePageContent(pageId, blocks)
    }

    return (
        <Editor
            pageId={pageId}
            initialBlocks={initialBlocks}
            onSave={handleSave}
        />
    )
}