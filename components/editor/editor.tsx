'use client'

import { useState, useCallback, useRef, KeyboardEvent } from 'react'
import { Block, BlockType } from '@/types/editor'
import BlockComponent from './block'
import SlashMenu from './slash-menu'

type EditorProps = {
    pageId: string
    initialBlocks: Block[]
    onSave: (blocks: Block[]) => void
}

function createBlock(type: BlockType = 'paragraph'): Block {
    return {
        id: crypto.randomUUID(),
        type,
        content: '',
        checked: false,
    }
}

export default function Editor({ pageId, initialBlocks, onSave }: EditorProps) {
    const [blocks, setBlocks] = useState<Block[]>(
        initialBlocks.length > 0 ? initialBlocks : [createBlock()]
    )
    const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0].id)
    const [slashMenu, setSlashMenu] = useState<{
        visible: boolean
        blockId: string
        position: { top: number; left: number }
    }>({ visible: false, blockId: '', position: { top: 0, left: 0 } })

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const blockRefs = useRef<Record<string, HTMLElement | null>>({})

    const debouncedSave = useCallback((updatedBlocks: Block[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            onSave(updatedBlocks)
        }, 1000)
    }, [onSave])

    function updateBlockContent(id: string, content: string) {
        if (content === '/') {
            const element = document.getElementById(`block-${id}`)
            if (element) {
                const rect = element.getBoundingClientRect()
                setSlashMenu({
                    visible: true,
                    blockId: id,
                    position: { top: rect.bottom + window.scrollY, left: rect.left },
                })
            }
        } else {
            setSlashMenu((prev) => ({ ...prev, visible: false }))
        }

        const updated = blocks.map((b) =>
            b.id === id ? { ...b, content } : b
        )
        setBlocks(updated)
        debouncedSave(updated)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>, id: string) {
        const index = blocks.findIndex((b) => b.id === id)

        if (e.key === 'Enter') {
            e.preventDefault()
            const newBlock = createBlock()
            const updated = [
                ...blocks.slice(0, index + 1),
                newBlock,
                ...blocks.slice(index + 1),
            ]
            setBlocks(updated)
            setSelectedBlockId(newBlock.id)
            debouncedSave(updated)
            setTimeout(() => {
                blockRefs.current[newBlock.id]?.focus()
            }, 0)
        }

        if (e.key === 'Backspace' && blocks[index].content === '') {
            e.preventDefault()
            if (blocks.length === 1) return
            const updated = blocks.filter((b) => b.id !== id)
            setBlocks(updated)
            const prevBlock = blocks[index - 1] || blocks[index + 1]
            setSelectedBlockId(prevBlock.id)
            debouncedSave(updated)
        }

        if (e.key === 'Escape') {
            setSlashMenu((prev) => ({ ...prev, visible: false }))
        }
    }

    function toggleTodo(id: string) {
        const updated = blocks.map((b) =>
            b.id === id ? { ...b, checked: !b.checked } : b
        )
        setBlocks(updated)
        debouncedSave(updated)
    }

    function changeBlockType(type: BlockType) {
        const updated = blocks.map((b) =>
            b.id === slashMenu.blockId ? { ...b, type, content: '' } : b
        )
        setBlocks(updated)
        setSlashMenu((prev) => ({ ...prev, visible: false }))
        setSelectedBlockId(slashMenu.blockId)

        // focus the block after type changes
        setTimeout(() => {
            blockRefs.current[slashMenu.blockId]?.focus()
        }, 0)
    }

    return (
        <div className="relative max-w-3xl mx-auto px-8 py-12">
            <div className="flex flex-col gap-1">
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        id={`block-${block.id}`}
                        onClick={() => setSelectedBlockId(block.id)}
                        className="py-0.5"
                    >
                        <BlockComponent
                            block={block}
                            onChange={updateBlockContent}
                            onKeyDown={handleKeyDown}
                            onToggleTodo={toggleTodo}
                            isSelected={selectedBlockId === block.id}
                            onRef={(el) => { blockRefs.current[block.id] = el }}
                        />
                    </div>
                ))}
            </div>

            {slashMenu.visible && (
                <SlashMenu
                    onSelect={changeBlockType}
                    position={slashMenu.position}
                />
            )}
        </div>
    )
}