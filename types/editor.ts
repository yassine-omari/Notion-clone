export type BlockType =
    | 'paragraph'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'todo'
    | 'bullet'

export type Block = {
    id: string
    type: BlockType
    content: string
    checked?: boolean
}