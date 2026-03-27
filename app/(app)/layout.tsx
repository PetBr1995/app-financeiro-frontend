'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'
import { AUTH_TOKEN_KEY } from '@/lib/auth'

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY)

        await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        setIsAuthorized(true)
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        router.replace('/login')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    void validateSession()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
        Verificando sessão...
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
