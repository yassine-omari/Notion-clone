'use client'

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'
import { Block, BlockType } from '@/types/editor'
import BlockComponent from './block'
import SlashMenu from './slash-menu'

type EditorProps = {
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

function focusAtOffset(el: HTMLElement, offset: number) {
    el.focus()
    const range = document.createRange()
    const sel = window.getSelection()
    const textNode = el.firstChild || el
    const safeOffset = Math.min(offset, el.textContent?.length || 0)
    range.setStart(textNode, safeOffset)
    range.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(range)
}

function focusAtEnd(el: HTMLElement) {
    focusAtOffset(el, el.textContent?.length || 0)
}

function isCursorAtStart(el: HTMLElement): boolean {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false

    const range = sel.getRangeAt(0)
    if (!el.contains(range.startContainer)) return false

    const preRange = document.createRange()
    preRange.selectNodeContents(el)
    preRange.setEnd(range.startContainer, range.startOffset)
    return preRange.toString().length === 0
}

function openSlashMenu(blockId: string) {
    const element = document.getElementById(`block-${blockId}`)
    if (!element) return null

    const rect = element.getBoundingClientRect()
    return {
        visible: true as const,
        blockId,
        filter: '',
        position: { top: rect.bottom + window.scrollY, left: rect.left },
    }
}

export default function Editor({ initialBlocks, onSave }: EditorProps) {
    const [blocks, setBlocks] = useState<Block[]>(
        initialBlocks.length > 0 ? initialBlocks : [createBlock()]
    )
    const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0].id)
    const [slashMenu, setSlashMenu] = useState<{
        visible: boolean
        blockId: string
        filter: string
        position: { top: number; left: number }
    }>({ visible: false, blockId: '', filter: '', position: { top: 0, left: 0 } })

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const blockRefs = useRef<Record<string, HTMLElement | null>>({})
    const blocksRef = useRef(blocks)
    const onSaveRef = useRef(onSave)
    const pendingBlocksRef = useRef<Block[] | null>(null)

    useEffect(() => {
        onSaveRef.current = onSave
    }, [onSave])

    useEffect(() => {
        blocksRef.current = blocks
    }, [blocks])

    const debouncedSave = useCallback((updatedBlocks: Block[]) => {
        pendingBlocksRef.current = updatedBlocks
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            onSaveRef.current(updatedBlocks)
            pendingBlocksRef.current = null
        }, 1000)
    }, [])

    useEffect(() => {
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current)
            if (pendingBlocksRef.current) {
                onSaveRef.current(pendingBlocksRef.current)
            }
        }
    }, [])

    const updateBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
        setBlocks((prev) => {
            const updated = updater(prev)
            debouncedSave(updated)
            return updated
        })
    }, [debouncedSave])

    function updateBlockContent(id: string, content: string) {
        if (content.startsWith('/')) {
            const menuState = openSlashMenu(id)
            if (menuState) {
                setSlashMenu({
                    ...menuState,
                    filter: content.slice(1),
                })
            }
        } else {
            setSlashMenu((prev) => ({ ...prev, visible: false }))
        }

        updateBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, content } : b))
        )
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>, id: string) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault()
            document.execCommand('insertLineBreak')
            return
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            setSlashMenu((prev) => ({ ...prev, visible: false }))

            const newBlock = createBlock()
            updateBlocks((prev) => {
                const index = prev.findIndex((b) => b.id === id)
                return [
                    ...prev.slice(0, index + 1),
                    newBlock,
                    ...prev.slice(index + 1),
                ]
            })
            setSelectedBlockId(newBlock.id)
            setTimeout(() => {
                blockRefs.current[newBlock.id]?.focus()
            }, 0)
            return
        }

        if (e.key === 'Backspace') {
            const currentEl = blockRefs.current[id]
            if (!currentEl) return

            const content = currentEl.textContent || ''
            const currentBlocks = blocksRef.current
            const index = currentBlocks.findIndex((b) => b.id === id)

            if (content === '' && currentBlocks.length > 1) {
                e.preventDefault()
                setSlashMenu((prev) => ({ ...prev, visible: false }))

                const prevBlock = currentBlocks[index - 1] ?? currentBlocks[index + 1]
                updateBlocks((prev) => prev.filter((b) => b.id !== id))
                setSelectedBlockId(prevBlock.id)

                setTimeout(() => {
                    const el = blockRefs.current[prevBlock.id]
                    if (el) focusAtEnd(el)
                }, 0)
                return
            }

            if (index > 0 && isCursorAtStart(currentEl)) {
                e.preventDefault()
                setSlashMenu((prev) => ({ ...prev, visible: false }))

                const prevBlock = currentBlocks[index - 1]
                const mergedContent = prevBlock.content + content
                const mergeOffset = prevBlock.content.length

                updateBlocks((prev) =>
                    prev
                        .filter((b) => b.id !== id)
                        .map((b) =>
                            b.id === prevBlock.id ? { ...b, content: mergedContent } : b
                        )
                )
                setSelectedBlockId(prevBlock.id)

                setTimeout(() => {
                    const el = blockRefs.current[prevBlock.id]
                    if (el) {
                        el.textContent = mergedContent
                        focusAtOffset(el, mergeOffset)
                    }
                }, 0)
                return
            }
        }

        if (e.key === 'Escape') {
            if (slashMenu.visible && slashMenu.blockId === id) {
                e.preventDefault()
                setSlashMenu((prev) => ({ ...prev, visible: false }))
                updateBlocks((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, content: '' } : b))
                )
                setTimeout(() => {
                    const el = blockRefs.current[id]
                    if (el) {
                        el.textContent = ''
                        el.focus()
                    }
                }, 0)
            }
        }
    }

    function toggleTodo(id: string) {
        updateBlocks((prev) =>
            prev.map((b) =>
                b.id === id ? { ...b, checked: !b.checked } : b
            )
        )
    }

    function changeBlockType(type: BlockType) {
        const blockId = slashMenu.blockId

        updateBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId ? { ...b, type, content: '' } : b
            )
        )
        setSlashMenu((prev) => ({ ...prev, visible: false }))
        setSelectedBlockId(blockId)

        setTimeout(() => {
            const el = blockRefs.current[blockId]
            if (el) {
                el.textContent = ''
                el.focus()
            }
        }, 0)
    }

    function appendBlockAtEnd() {
        const newBlock = createBlock()
        updateBlocks((prev) => [...prev, newBlock])
        setSelectedBlockId(newBlock.id)
        setTimeout(() => {
            blockRefs.current[newBlock.id]?.focus()
        }, 0)
    }

    return (
        <div
            className="px-16 py-12 relative min-h-screen"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    appendBlockAtEnd()
                }
            }}
        >
            <div className="flex flex-col gap-2">
                {blocks.map((block) => (
                    <div
                        key={block.id}
                        id={`block-${block.id}`}
                        onClick={() => {
                            setSelectedBlockId(block.id)
                            blockRefs.current[block.id]?.focus()
                        }}
                        className={`py-1 px-2 rounded-md transition-all cursor-text border-l-2 ${
                            selectedBlockId === block.id
                                ? 'border-gray-400 bg-white/70'
                                : 'border-transparent hover:border-gray-200 hover:bg-white/40'
                        }`}
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
                    filter={slashMenu.filter}
                />
            )}
        </div>
    )
}
