import { Block, BlockType } from '@/types/editor'

const VALID_BLOCK_TYPES: BlockType[] = [
    'paragraph',
    'heading_1',
    'heading_2',
    'heading_3',
    'todo',
    'bullet',
]

function isValidBlockType(type: unknown): type is BlockType {
    return typeof type === 'string' && VALID_BLOCK_TYPES.includes(type as BlockType)
}

function isValidBlock(item: unknown): item is Block {
    if (!item || typeof item !== 'object') return false

    const block = item as Record<string, unknown>
    return (
        typeof block.id === 'string' &&
        isValidBlockType(block.type) &&
        typeof block.content === 'string' &&
        (block.checked === undefined || typeof block.checked === 'boolean')
    )
}

export function parseBlocks(content: unknown): Block[] {
    if (!Array.isArray(content)) return []
    return content.filter(isValidBlock)
}
