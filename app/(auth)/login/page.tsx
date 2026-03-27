'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'
import { AUTH_TOKEN_KEY } from '@/lib/auth'

type LoginResponse = {
  message?: string
  token?: string
  access_token?: string
  [key: string]: unknown
}

const extractToken = (payload: LoginResponse) => {
  if (typeof payload.token === 'string' && payload.token.length > 0) {
    return payload.token
  }

  if (
    typeof payload.access_token === 'string' &&
    payload.access_token.length > 0
  ) {
    return payload.access_token
  }

  return null
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY) || ''}`,
          },
        },
      )

      const payload = response.data ?? {}

      const token = extractToken(payload)

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      }

      setEmail('')
      setPassword('')
      router.push('/home')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message
        setError(
          typeof apiMessage === 'string' ? apiMessage : 'Falha ao autenticar.',
        )
      } else {
        setError('Erro inesperado no login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070B14] px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-2 text-base text-white/70">Digite suas credenciais de acesso</p>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-white/85">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rafael.martins@example.com"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-white/30"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-white/85">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-white/30"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="cursor-pointer text-sm text-white/70 underline underline-offset-4"
            >
              Esqueceu sua senha?
            </button>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full rounded-xl bg-[#22C985] px-4 py-3 font-semibold text-[#052014] transition hover:bg-[#1ab375] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Ainda não tem uma conta?{' '}
          <Link
            href="/register"
            className="cursor-pointer font-semibold text-[#22C985] underline underline-offset-4"
          >
            Cadastre-se
          </Link>
        </p>

        <p className="mt-4 text-center text-[11px] text-white/35">
          API: <span className="font-mono">{API_BASE_URL}</span>
        </p>
      </div>
    </section>
  )
}
