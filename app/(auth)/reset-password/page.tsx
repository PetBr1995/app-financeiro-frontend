'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const prepareReset = async () => {
      if (!isSupabaseConfigured) {
        setGlobalError('Supabase não configurado no frontend.')
        return
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setGlobalError(error.message || 'Não foi possível validar o link de redefinição.')
        return
      }

      if (!data.session) {
        setGlobalError('Link inválido ou expirado. Solicite uma nova recuperação de senha.')
        return
      }

      setReady(true)
    }

    prepareReset()
  }, [])

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGlobalError('')
    setPasswordError('')
    setSuccessMessage('')

    if (password.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setGlobalError(error.message || 'Erro ao redefinir senha.')
        return
      }

      setSuccessMessage('Senha redefinida com sucesso.')

      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch {
      setGlobalError('Erro inesperado ao redefinir senha.')
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
          Defina sua nova senha de acesso.
        </p>

        <form onSubmit={handleResetPassword} className="mt-10 space-y-5">
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
            disabled={loading || !ready}
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
