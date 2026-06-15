'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function LoadingBarInner() {
    const [width, setWidth] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const t1 = setTimeout(() => setWidth(70), 50)
        const t2 = setTimeout(() => setWidth(90), 500)
        const t3 = setTimeout(() => setWidth(100), 800)
        const t4 = setTimeout(() => setDone(true), 1000)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(t4)
        }
    }, [])

    if (done) return null

    return (
        <div
            className="fixed top-0 left-0 z-[9999] h-[2px] bg-gray-800 transition-all duration-300 ease-out"
            style={{ width: `${width}%` }}
        />
    )
}

export default function LoadingBar() {
    const pathname = usePathname()
    return <LoadingBarInner key={pathname} />
}
