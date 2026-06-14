'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleSignup() {
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-2xl font-semibold mb-6">Create account</h1>

            <div className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-500"
                />

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Sign up'}
                </button>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-black underline">
                    Log in
                </Link>
            </p>
        </div>
    )
}