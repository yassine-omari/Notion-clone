'use client'

import { KeyboardEvent, useEffect, useRef } from 'react'
import { Block } from '@/types/editor'

type BlockProps = {
  block: Block
  onChange: (id: string, content: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLElement>, id: string) => void
  onToggleTodo: (id: string) => void
  isSelected: boolean
  onRef: (el: HTMLElement | null) => void
}

type EditableProps = {
  block: Block
  onChange: (id: string, content: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLElement>, id: string) => void
  onRef: (el: HTMLElement | null) => void
  className?: string
  Tag?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div'
}

function Editable({
  block,
  onChange,
  onKeyDown,
  onRef,
  className = '',
  Tag = 'p',
}: EditableProps) {
  const innerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (document.activeElement === el) return
    if (el.textContent !== block.content) {
      el.textContent = block.content
    }
  }, [block.id, block.type, block.content])

  const setRef = (el: HTMLElement | null) => {
    innerRef.current = el
    onRef(el)
    if (el && el.textContent !== block.content) {
      el.textContent = block.content
    }
  }

  return (
    <Tag
      ref={setRef as never}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(block.id, e.currentTarget.textContent || '')}
      onKeyDown={(e) => onKeyDown(e, block.id)}
      className={`outline-none w-full min-h-[1.5rem] cursor-text whitespace-pre-wrap ${className}`}
    />
  )
}

export default function BlockComponent({
  block,
  onChange,
  onKeyDown,
  onToggleTodo,
  onRef,
}: BlockProps) {
  if (block.type === 'heading_1') {
    return (
      <Editable
        block={block}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onRef={onRef}
        Tag="h1"
        className="text-3xl font-bold"
      />
    )
  }

  if (block.type === 'heading_2') {
    return (
      <Editable
        block={block}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onRef={onRef}
        Tag="h2"
        className="text-2xl font-semibold"
      />
    )
  }

  if (block.type === 'heading_3') {
    return (
      <Editable
        block={block}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onRef={onRef}
        Tag="h3"
        className="text-xl font-medium"
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
          className="mt-1.5 cursor-pointer"
        />
        <Editable
          block={block}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onRef={onRef}
          Tag="span"
          className={block.checked ? 'line-through text-gray-400' : ''}
        />
      </div>
    )
  }

  if (block.type === 'bullet') {
    return (
      <div className="flex items-start gap-2">
        <span className="text-gray-600 flex-shrink-0">•</span>
        <Editable
          block={block}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onRef={onRef}
          Tag="span"
        />
      </div>
    )
  }

  return (
    <Editable
      block={block}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onRef={onRef}
      Tag="p"
      className="text-gray-800"
    />
  )
}
