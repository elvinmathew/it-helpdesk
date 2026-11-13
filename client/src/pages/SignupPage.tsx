import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordField } from '../components/auth/PasswordField'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { applyApiError } from '../lib/form-errors'
import { signupSchema, type SignupValues } from '../lib/validation'

export function SignupPage() {
  const navigate = useNavigate()
  const { register: createAccount } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      navigate('/login', {
        replace: true,
        state: {
          notice: 'Your account was created. Sign in to continue.',
          email: values.email,
        },
      })
    } catch (error) {
      applyApiError(error, setError, setFormError, [
        'name',
        'email',
        'password',
        'confirmPassword',
      ])
    }
  })

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          New accounts start with employee access. An admin can update your role
          later.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {formError ? <Alert>{formError}</Alert> : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <TextField
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            startIcon={<User className="size-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

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
            autoComplete="new-password"
            placeholder="Create a password"
            hint="At least 8 characters, including a letter and a number."
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-700 underline-offset-2 hover:text-brand-800 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
