'use client'

import { KeyboardEvent } from 'react'
import { Block } from '@/types/editor'



type BlockProps = {
  block: Block
  onChange: (id: string, content: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLElement>, id: string) => void
  onToggleTodo: (id: string) => void
  isSelected: boolean
  onRef: (el: HTMLElement | null) => void
}

export default function BlockComponent({
  block,
  onChange,
  onKeyDown,
  onToggleTodo,
  onRef,
}: BlockProps) {


  const editableProps = {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    onInput: (e: React.FormEvent<HTMLElement>) =>
      onChange(block.id, e.currentTarget.textContent || ''),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => onKeyDown(e, block.id),
    className: 'outline-none w-full min-h-[1.5rem] cursor-text',
    ref: (el: HTMLElement | null) => {
      onRef(el)
      if (el && el.textContent !== block.content) {
        el.textContent = block.content
      }
    },
  }
  if (block.type === 'heading_1') {
    return (
      <h1
        {...editableProps}
        className={`${editableProps.className} text-3xl font-bold`}
      />

    )
  }

  if (block.type === 'heading_2') {
    return (
      <h2
        {...editableProps}
        className={`${editableProps.className} text-2xl font-semibold`}
      />

    )
  }

  if (block.type === 'heading_3') {
    return (
      <h3

        {...editableProps}
        className={`${editableProps.className} text-xl font-medium`}
      />

    )
  }

  if (block.type === 'todo') {
    return (
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={block.checked || false}
          onChange={() => onToggleTodo(block.id)}
          className="mt-1 cursor-pointer"
        />
        <span
          {...editableProps}
          className={`${editableProps.className} ${block.checked ? 'line-through text-gray-400' : ''}`}
        />

      </div>
    )
  }

  if (block.type === 'bullet') {
    return (
      <div className="flex items-start gap-2">
        <span className="mt-1 text-gray-600 flex-shrink-0">•</span>
        <span
          {...editableProps}
        />
      </div>
    )
  }

  return (
    <p
      {...editableProps}
      className={`${editableProps.className} text-gray-800`}
    />

  )
}