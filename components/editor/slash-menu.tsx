'use client'

import { BlockType } from '@/types/editor'

type MenuItem = {
    type: BlockType
    label: string
    description: string
}

const MENU_ITEMS: MenuItem[] = [
    { type: 'paragraph', label: 'Text', description: 'Plain paragraph' },
    { type: 'heading_1', label: 'Heading 1', description: 'Large heading' },
    { type: 'heading_2', label: 'Heading 2', description: 'Medium heading' },
    { type: 'heading_3', label: 'Heading 3', description: 'Small heading' },
    { type: 'todo', label: 'To-do', description: 'Checkbox task' },
    { type: 'bullet', label: 'Bullet', description: 'Bulleted list item' },
]

type SlashMenuProps = {
    onSelect: (type: BlockType) => void
    position: { top: number; left: number }
}

export default function SlashMenu({ onSelect, position }: SlashMenuProps) {
    return (
        <div
            style={{ top: position.top, left: position.left }}
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 overflow-hidden"
        >
            <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Block type</p>
            {MENU_ITEMS.map((item) => (
                <button
                    key={item.type}
                    onClick={() => onSelect(item.type)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                >
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.description}</span>
                </button>
            ))}
        </div>
    )
}