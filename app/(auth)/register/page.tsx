'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'
import { AUTH_TOKEN_KEY } from '@/lib/auth'

type RegisterResponse = {
  data?: {
    access_token?: string
  }
  token?: string
  access_token?: string
  [key: string]: unknown
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[] | string | undefined>
  }
}

const extractToken = (payload: RegisterResponse) => {
  if (
    typeof payload.data?.access_token === 'string' &&
    payload.data.access_token.length > 0
  ) {
    return payload.data.access_token
  }

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

const getFirstError = (value: string[] | string | undefined) => {
  if (Array.isArray(value)) return value[0] ?? ''
  if (typeof value === 'string') return value
  return ''
}

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGlobalError('')
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setLoading(true)

    try {
      const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/api/auth/register`,
        { email, name, password },
        {
          withCredentials: true,
        },
      )

      const payload = response.data ?? {}
      console.log('[REGISTER][TRY] status:', response.status)
      console.log('[REGISTER][TRY] payload:', payload)

      const token = extractToken(payload)

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        router.push('/home')
        return
      }

      router.push('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as ApiErrorPayload | undefined)?.error
        const code = apiError?.code
        const message = apiError?.message || 'Erro inesperado.'
        const details = apiError?.details || {}

        const nextNameError = getFirstError(details.name)
        const nextEmailError = getFirstError(details.email)
        const nextPasswordError = getFirstError(details.password)

        setNameError(nextNameError)
        setEmailError(nextEmailError)
        setPasswordError(nextPasswordError)

        const hasFieldErrors = Boolean(
          nextNameError || nextEmailError || nextPasswordError,
        )

        console.log('[REGISTER][CATCH] status:', err.response?.status)
        console.log('[REGISTER][CATCH] payload:', err.response?.data)
        console.log('[REGISTER][CATCH] parsed:', { code, message, details })

        if (code === 'app_error' || !hasFieldErrors) {
          setGlobalError(message)
        }
      } else {
        setGlobalError('Erro inesperado no cadastro.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-success-500/25 blur-3xl" />

      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-gradient-to-b from-gray-700/40 to-gray-900/70 p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <h1 className="text-h1 text-white">Crie sua conta</h1>
        <p className="mt-2 text-body text-gray-300">Comece sua jornada com a gente</p>

        <form onSubmit={handleRegister} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-small text-gray-100">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rafael Martins"
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder:text-gray-500 outline-none transition ${
                nameError
                  ? 'border-error-500 bg-error-100/10'
                  : 'border-gray-500 bg-white/[0.04] focus:border-primary-500'
              }`}
              autoComplete="name"
              required
            />
            {nameError ? (
              <p className="text-small text-error-100">{nameError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-small text-gray-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rafael.martins@example.com"
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder:text-gray-500 outline-none transition ${
                emailError
                  ? 'border-error-500 bg-error-100/10'
                  : 'border-gray-500 bg-white/[0.04] focus:border-primary-500'
              }`}
              autoComplete="email"
              required
            />
            {emailError ? (
              <p className="text-small text-error-100">{emailError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-small text-gray-100">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder:text-gray-500 outline-none transition ${
                passwordError
                  ? 'border-error-500 bg-error-100/10'
                  : 'border-gray-500 bg-white/[0.04] focus:border-primary-500'
              }`}
              autoComplete="new-password"
              required
            />
            {passwordError ? (
              <p className="text-small text-error-100">{passwordError}</p>
            ) : null}
          </div>

          {globalError ? (
            <p className="rounded-[8px] border border-error-500 bg-error-100/20 px-3 py-2 text-small text-error-100">
              {globalError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full rounded-xl bg-success-500 px-4 py-3 font-semibold text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-small text-gray-300">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="cursor-pointer font-semibold text-primary-500 underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>

        <p className="mt-4 text-center text-[11px] text-gray-500">
          API: <span className="font-mono">{API_BASE_URL}</span>
        </p>
      </div>
    </section>
  )
}
