import type { ReactNode } from 'react'
import { Logo } from '../Logo'

const ROLE_NOTES = [
  {
    role: 'Employee',
    note: 'Raise tickets and follow their progress.',
  },
  {
    role: 'Agent',
    note: 'Work the queue and keep tickets moving.',
  },
  {
    role: 'Admin',
    note: 'Manage people, statuses, and workflow rules.',
  },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <aside className="hidden bg-brand-950 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <Logo tone="dark" />

          <div className="max-w-md py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              Internal IT support
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white">
              Raise, track, and resolve IT issues.
            </h1>
            <p className="mt-4 text-sm leading-6 text-brand-200">
              A single workspace for the people who report problems and the
              people who fix them.
            </p>

            <dl className="mt-8 divide-y divide-white/10 border-t border-white/10">
              {ROLE_NOTES.map((item) => (
                <div key={item.role} className="py-3">
                  <dt className="text-sm font-medium text-white">
                    {item.role}
                  </dt>
                  <dd className="mt-0.5 text-sm text-brand-200">
                    {item.note}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-xs text-brand-300">Internal tool</p>
        </aside>

        <main className="flex min-h-dvh flex-col px-5 py-8 sm:px-8 lg:min-h-0 lg:justify-center lg:px-12 lg:py-12">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div className="mx-auto w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
