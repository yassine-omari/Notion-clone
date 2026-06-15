'use client'

import { useCallback } from 'react'
import Editor from './editor'
import { Block } from '@/types/editor'
import { savePageContent } from '@/app/actions/pages'

type Props = {
    pageId: string
    initialBlocks: Block[]
}

export default function EditorWrapper({ pageId, initialBlocks }: Props) {
    const handleSave = useCallback(async (blocks: Block[]) => {
        await savePageContent(pageId, blocks)
    }, [pageId])

    return (
        <Editor
            key={pageId}
            initialBlocks={initialBlocks}
            onSave={handleSave}
        />
    )
}
