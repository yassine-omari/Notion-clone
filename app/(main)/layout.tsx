import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWorkspaces } from '@/app/actions/workspaces'
import Sidebar from '@/components/sidebar/sidebar'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const workspaces = await getWorkspaces()

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar workspaces={workspaces} />
            <main className="flex-1 overflow-y-auto bg-white">
                {children}
            </main>
        </div>
    )
}