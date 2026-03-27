'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'

type ForgotPasswordResponse = {
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGlobalError('')
    setEmailError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await axios.post<ForgotPasswordResponse>(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email },
        { withCredentials: true },
      )

      const data = response.data ?? {}
      console.log('[FORGOT][TRY] status:', response.status)
      console.log('[FORGOT][TRY] payload:', data)
      const message =
        typeof data.message === 'string'
          ? data.message
          : 'Solicitação enviada com sucesso.'
      setSuccessMessage(message)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = (err.response?.data as ApiErrorPayload | undefined)?.error
        const code = apiError?.code
        const message = apiError?.message || 'Erro ao solicitar recuperação.'
        const details = apiError?.details || {}

        const nextEmailError = getFirstError(details.email)
        setEmailError(nextEmailError)

        if (code === 'email_not_configured') {
          setGlobalError('Serviço de email não configurado no backend.')
        } else if (!nextEmailError) {
          setGlobalError(message)
        }

        console.log('[FORGOT][CATCH] status:', err.response?.status)
        console.log('[FORGOT][CATCH] payload:', err.response?.data)
      } else {
        setGlobalError('Erro inesperado ao solicitar recuperação.')
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
        <h1 className="text-h1 text-white">Recuperar senha</h1>
        <p className="mt-2 text-body text-gray-300">
          Informe seu email para receber o token de redefinição.
        </p>

        <form onSubmit={handleForgotPassword} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-small text-gray-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
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
            disabled={loading}
            className="cursor-pointer w-full rounded-xl bg-primary-500 px-4 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar recuperação'}
          </button>
        </form>

        <p className="mt-6 text-center text-small text-gray-300">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="cursor-pointer font-semibold text-success-500 underline underline-offset-4"
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </section>
  )
}
