'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'

type ResetPasswordResponse = {
  message?: string
  [key: string]: unknown
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[] | string | undefined>
  }
}

const getFirstError = (value: string[] | string | undefined) => {
  if (Array.isArray(value)) return value[0] ?? ''
  if (typeof value === 'string') return value
  return ''
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    if (tokenFromQuery) {
      setToken(tokenFromQuery)
    }
  }, [searchParams])

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGlobalError('')
    setTokenError('')
    setPasswordError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await axios.post<ResetPasswordResponse>(
        `${API_BASE_URL}/api/auth/reset-password`,
        { password, token },
        { withCredentials: true },
      )

      const data = response.data ?? {}
      const message =
        typeof data.message === 'string'
          ? data.message
          : 'Senha redefinida com sucesso.'
      setSuccessMessage(message)

      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as ApiErrorPayload | undefined)?.error
        const code = apiError?.code
        const message = apiError?.message || 'Erro ao redefinir senha.'
        const details = apiError?.details || {}

        const nextPasswordError = getFirstError(details.password)
        const nextTokenError =
          code === 'invalid_reset_token'
            ? 'Link inválido ou expirado.'
            : getFirstError(details.token)

        setTokenError(nextTokenError)
        setPasswordError(nextPasswordError)

        if (code === 'invalid_reset_token') {
          setGlobalError('Link inválido ou expirado.')
        } else if (!nextTokenError && !nextPasswordError) {
          setGlobalError(message)
        }

        console.log('[RESET][CATCH] status:', err.response?.status)
        console.log('[RESET][CATCH] payload:', err.response?.data)
        console.log('[RESET][CATCH] parsed:', { code, message, details })
      } else {
        setGlobalError('Erro inesperado ao redefinir senha.')
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
        <h1 className="text-h1 text-white">Redefinir senha</h1>
        <p className="mt-2 text-body text-gray-300">
          Informe o token recebido e sua nova senha.
        </p>

        <form onSubmit={handleResetPassword} className="mt-10 space-y-5">
          {!token ? (
            <p className="rounded-[8px] border border-error-500 bg-error-100/20 px-3 py-2 text-small text-error-100">
              Token não encontrado na URL. Abra o link recebido por email.
            </p>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="token" className="text-small text-gray-100">
              Token
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token de recuperação"
              className={`w-full rounded-xl border px-4 py-3 text-white placeholder:text-gray-500 outline-none transition ${
                tokenError
                  ? 'border-error-500 bg-error-100/10'
                  : 'border-gray-500 bg-white/[0.04] focus:border-primary-500'
              }`}
              autoComplete="off"
              required
            />
            {tokenError ? (
              <p className="text-small text-error-100">{tokenError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-small text-gray-100">
              Nova senha
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

          {successMessage ? (
            <p className="rounded-[8px] border border-success-500 bg-success-100/20 px-3 py-2 text-small text-success-100">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !token}
            className="cursor-pointer w-full rounded-xl bg-success-500 px-4 py-3 font-semibold text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>

        <p className="mt-6 text-center text-small text-gray-300">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="cursor-pointer font-semibold text-primary-500 underline underline-offset-4"
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </section>
  )
}
