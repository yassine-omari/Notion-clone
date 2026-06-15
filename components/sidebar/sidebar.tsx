'use client'

import { useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    getPages,
    createPage,
    createWorkspace,
    renamePage,
    renameWorkspace,
    deletePage,
    deleteWorkspace,
} from '@/app/actions/workspaces'

type Workspace = {
    id: string
    title: string
    emoji: string | null
}

type Page = {
    id: string
    title: string
    workspaceId: string
}

type Props = {
    workspaces: Workspace[]
}

export default function Sidebar({ workspaces }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null)
    const [pages, setPages] = useState<Record<string, Page[]>>({})
    const [creatingWorkspace, setCreatingWorkspace] = useState(false)
    const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('')
    const [creatingPageInWorkspace, setCreatingPageInWorkspace] = useState<string | null>(null)
    const [newPageTitle, setNewPageTitle] = useState('')
    const [renamingPage, setRenamingPage] = useState<string | null>(null)
    const [renamingWorkspace, setRenamingWorkspace] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [contextMenu, setContextMenu] = useState<{
        type: 'workspace' | 'page'
        id: string
        workspaceId?: string
        x: number
        y: number
    } | null>(null)
    const [contextFocusId, setContextFocusId] = useState<string | null>(null)
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    function closeContextMenu() {
        setContextMenu(null)
        setContextFocusId(null)
    }

    function handleTouchStart(type: 'workspace' | 'page', id: string, workspaceId: string | undefined, e: React.TouchEvent) {
        longPressTimer.current = setTimeout(() => {
            const touch = e.touches[0]
            setContextFocusId(id)
            setContextMenu({ type, id, workspaceId, x: touch.clientX, y: touch.clientY })
        }, 600)
    }

    function handleTouchEnd() {
        if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }

    async function handleWorkspaceClick(workspaceId: string) {
        if (expandedWorkspace === workspaceId) {
            setExpandedWorkspace(null)
            return
        }
        setExpandedWorkspace(workspaceId)
        const workspacePages = await getPages(workspaceId)
        setPages((prev) => ({ ...prev, [workspaceId]: workspacePages }))
    }

    async function handleCreatePage(workspaceId: string) {
        if (!newPageTitle.trim()) {
            setCreatingPageInWorkspace(null)
            setNewPageTitle('')
            return
        }
        const page = await createPage(workspaceId, newPageTitle)
        setPages((prev) => ({
            ...prev,
            [workspaceId]: [...(prev[workspaceId] || []), page],
        }))
        setCreatingPageInWorkspace(null)
        setNewPageTitle('')
        router.push(`/workspace/${workspaceId}/${page.id}`)
    }

    async function handleCreateWorkspace() {
        if (!newWorkspaceTitle.trim()) {
            setCreatingWorkspace(false)
            setNewWorkspaceTitle('')
            return
        }
        await createWorkspace(newWorkspaceTitle)
        setNewWorkspaceTitle('')
        setCreatingWorkspace(false)
        router.refresh()
    }

    async function handleDeletePage(pageId: string, workspaceId: string) {
        const remaining = (pages[workspaceId] || []).filter((p) => p.id !== pageId)
        const isCurrentPage = pathname === `/workspace/${workspaceId}/${pageId}`

        await deletePage(pageId)
        setPages((prev) => ({
            ...prev,
            [workspaceId]: remaining,
        }))
        closeContextMenu()

        if (isCurrentPage) {
            if (remaining.length > 0) {
                router.push(`/workspace/${workspaceId}/${remaining[0].id}`)
            } else {
                router.push('/dashboard')
            }
        }

        router.refresh()
    }

    async function handleDeleteWorkspace(workspaceId: string) {
        await deleteWorkspace(workspaceId)
        closeContextMenu()

        if (pathname.startsWith(`/workspace/${workspaceId}`)) {
            router.push('/dashboard')
        }

        router.refresh()
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="relative w-64 h-screen bg-[#f7f7f5] border-r border-gray-200 flex flex-col select-none">
            <div className="px-4 py-3 border-b border-gray-200">
                <h1 className="text-sm font-semibold text-gray-800">My Notion</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {workspaces.map((workspace) => (
                    <div key={workspace.id}>
                        <div
                            onClick={() => handleWorkspaceClick(workspace.id)}
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                setRenamingWorkspace(workspace.id)
                                setRenameValue(workspace.title)
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setContextFocusId(workspace.id)
                                setContextMenu({ type: 'workspace', id: workspace.id, x: e.clientX, y: e.clientY })
                            }}
                            onTouchStart={(e) => handleTouchStart('workspace', workspace.id, undefined, e)}
                            onTouchEnd={handleTouchEnd}
                            className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md cursor-pointer ${contextMenu && contextFocusId === workspace.id
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                }`}
                        >
                            <span className="text-sm">{workspace.emoji || '📁'}</span>
                            {renamingWorkspace === workspace.id ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            await renameWorkspace(workspace.id, renameValue)
                                            setRenamingWorkspace(null)
                                            router.refresh()
                                        }
                                        if (e.key === 'Escape') setRenamingWorkspace(null)
                                    }}
                                    onBlur={() => setRenamingWorkspace(null)}
                                    className="flex-1 text-sm bg-transparent outline-none border-none text-gray-700"
                                />
                            ) : (
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                    {workspace.title}
                                </span>
                            )}
                            <span className="text-gray-400 text-xs">
                                {expandedWorkspace === workspace.id ? '▾' : '▸'}
                            </span>
                        </div>

                        {expandedWorkspace === workspace.id && (
                            <div className="ml-4">
                                {(pages[workspace.id] || []).map((page) => (
                                    <div
                                        key={page.id}
                                        onClick={() => router.push(`/workspace/${workspace.id}/${page.id}`)}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation()
                                            setRenamingPage(page.id)
                                            setRenameValue(page.title)
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setContextFocusId(page.id)
                                            setContextMenu({ type: 'page', id: page.id, workspaceId: workspace.id, x: e.clientX, y: e.clientY })
                                        }}
                                        onTouchStart={(e) => handleTouchStart('page', page.id, workspace.id, e)}
                                        onTouchEnd={handleTouchEnd}
                                        className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md cursor-pointer text-sm ${pathname === `/workspace/${workspace.id}/${page.id}` && !contextMenu
                                                ? 'bg-gray-200 text-gray-900'
                                                : contextMenu && contextFocusId === page.id
                                                    ? 'bg-gray-200 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>📄</span>
                                        {renamingPage === page.id ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        await renamePage(page.id, renameValue)
                                                        setPages((prev) => ({
                                                            ...prev,
                                                            [workspace.id]: prev[workspace.id].map((p) =>
                                                                p.id === page.id ? { ...p, title: renameValue } : p
                                                            ),
                                                        }))
                                                        setRenamingPage(null)
                                                    }
                                                    if (e.key === 'Escape') setRenamingPage(null)
                                                }}
                                                onBlur={() => setRenamingPage(null)}
                                                className="flex-1 text-sm bg-transparent outline-none border-none"
                                            />
                                        ) : (
                                            <span className="truncate">{page.title}</span>
                                        )}
                                    </div>
                                ))}

                                {creatingPageInWorkspace === workspace.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Page name..."
                                        value={newPageTitle}
                                        onChange={(e) => setNewPageTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreatePage(workspace.id)
                                            if (e.key === 'Escape') {
                                                setCreatingPageInWorkspace(null)
                                                setNewPageTitle('')
                                            }
                                        }}
                                        onBlur={() => {
                                            if (newPageTitle.trim()) {
                                                handleCreatePage(workspace.id)
                                            } else {
                                                setCreatingPageInWorkspace(null)
                                                setNewPageTitle('')
                                            }
                                        }}
                                        className="w-full text-sm px-3 py-1.5 mx-1 bg-transparent outline-none text-gray-700 placeholder-gray-300"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setCreatingPageInWorkspace(workspace.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 w-full"
                                    >
                                        <span>+</span>
                                        <span>New page</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-gray-200 flex flex-col gap-2">
                {creatingWorkspace ? (
                    <input
                        autoFocus
                        type="text"
                        placeholder="Workspace name..."
                        value={newWorkspaceTitle}
                        onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateWorkspace()
                            if (e.key === 'Escape') {
                                setCreatingWorkspace(false)
                                setNewWorkspaceTitle('')
                            }
                        }}
                        onBlur={() => {
                            if (newWorkspaceTitle.trim()) {
                                handleCreateWorkspace()
                            } else {
                                setCreatingWorkspace(false)
                                setNewWorkspaceTitle('')
                            }
                        }}
                        className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder-gray-300"
                    />
                ) : (
                    <button
                        onClick={() => setCreatingWorkspace(true)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 w-full"
                    >
                        <span>+</span>
                        <span>New workspace</span>
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 w-full"
                >
                    <span>↩</span>
                    <span>Log out</span>
                </button>
            </div>

            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={closeContextMenu}
                    />
                    <div
                        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={() => {
                                if (contextMenu.type === 'workspace') {
                                    setRenamingWorkspace(contextMenu.id)
                                    setRenameValue(workspaces.find(w => w.id === contextMenu.id)?.title || '')
                                } else {
                                    setRenamingPage(contextMenu.id)
                                    const page = pages[contextMenu.workspaceId!]?.find(p => p.id === contextMenu.id)
                                    setRenameValue(page?.title || '')
                                }
                                closeContextMenu()
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            ✏️ Rename
                        </button>
                        <button
                            onClick={() => {
                                if (contextMenu.type === 'workspace') {
                                    handleDeleteWorkspace(contextMenu.id)
                                } else {
                                    handleDeletePage(contextMenu.id, contextMenu.workspaceId!)
                                }
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </>
            )}
        </aside>
    )
}
