import type { Metadata } from 'next'
import './globals.css'
import LoadingBar from '@/components/ui/loading-bar'

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'A Notion clone built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LoadingBar />
        {children}
      </body>
    </html>
  )
}