import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div
            className="flex flex-col items-center justify-center h-full text-center px-8"
            style={{
                backgroundImage: 'radial-gradient(circle, #d1d5db 0.8px, transparent 0.8px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="bg-white rounded-2xl px-12 py-10 shadow-sm border border-gray-100">
                <div className="mb-4 text-5xl">📝</div>
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    Welcome to My Notion
                </h1>
                <p className="text-gray-400 text-sm max-w-xs">
                    Select a workspace from the sidebar or create a new one to get started.
                </p>
            </div>
        </div>
    )
}