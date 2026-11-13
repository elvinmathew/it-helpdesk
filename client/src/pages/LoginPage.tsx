import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { USE_MOCK } from '../api/client'
import { DEMO_ACCOUNTS } from '../api/mock/storage'
import { useAuth } from '../auth/context'
import { homePath } from '../auth/roles'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordField } from '../components/auth/PasswordField'
import { Button } from '@/components/ui/button'
import { FeedbackAlert } from '../components/ui/FeedbackAlert'
import { TextField } from '../components/ui/TextField'
import { applyApiError } from '../lib/form-errors'
import { loginSchema, type LoginValues } from '../lib/validation'

interface LoginLocationState {
  notice?: string
  email?: string
  from?: string
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const state = (location.state ?? {}) as LoginLocationState
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: state.email ?? '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      const user = await login(values)
      const target =
        state.from && state.from.startsWith('/')
          ? state.from
          : homePath(user.role)

      navigate(target, { replace: true })
    } catch (error) {
      applyApiError(error, setError, setFormError, ['email', 'password'])
    }
  })

  const fillDemoAccount = (email: string, password: string) => {
    setFormError(null)
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Use your work email to access the helpdesk.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {state.notice ? (
          <FeedbackAlert tone="success">{state.notice}</FeedbackAlert>
        ) : null}
        {formError ? <FeedbackAlert>{formError}</FeedbackAlert> : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            startIcon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New to the helpdesk?{' '}
          <Link
            to="/signup"
            className="font-medium text-brand-700 underline-offset-2 hover:text-brand-800 hover:underline"
          >
            Create an account
          </Link>
        </p>

        {USE_MOCK ? (
          <section className="rounded-md border border-slate-200 bg-white p-3.5">
            <h3 className="text-xs font-medium text-slate-700">
              Demo accounts
              <span className="ml-1.5 font-normal text-slate-500">
                (mock mode)
              </span>
            </h3>

            <div className="mt-2 space-y-0.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() =>
                    fillDemoAccount(account.email, account.password)
                  }
                  className="flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="text-xs font-medium text-slate-700">
                    {account.label}
                  </span>
                  <span className="truncate font-mono text-[11px] text-slate-500">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-1.5 px-2 text-[11px] text-slate-500">
              Password: <span className="font-mono">Password123!</span>
            </p>
          </section>
        ) : null}
      </div>
    </AuthLayout>
  )
}
