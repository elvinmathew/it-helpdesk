import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <Logo />

      <p className="mt-10 text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        The page you are looking for does not exist or has moved.
      </p>

      <Link
        to="/"
        className="mt-6 text-sm font-medium text-brand-700 underline-offset-2 hover:text-brand-800 hover:underline"
      >
        Back to the helpdesk
      </Link>
    </div>
  )
}
